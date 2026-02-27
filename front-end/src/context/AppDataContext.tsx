/**
 * AppDataContext — Cache global de toutes les données.
 *
 * Principe :
 * - Toutes les données (articles, entrees, sorties, dashboard) sont chargées
 *   UNE SEULE FOIS au démarrage de l'app (dans App.tsx).
 * - Chaque page lit depuis le cache → affichage instantané, ZERO chargement.
 * - Après un ajout/suppression, on appelle refresh() pour resynchroniser
 *   uniquement la ressource modifiée.
 */

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { articlesApi }  from '../api/articles';
import { entreesApi }   from '../api/entrees';
import { sortiesApi }   from '../api/sorties';
import { dashboardApi } from '../api/dashboard';
import type { Article, Entree, Sortie, DashboardData } from '../types/stock';

interface AppData {
  articles:  Article[];
  entrees:   Entree[];
  sorties:   Sortie[];
  dashboard: DashboardData | null;
  loading:   boolean;
  error:     string | null;
  // Refresh sélectif après mutation
  refreshArticles:  () => Promise<void>;
  refreshEntrees:   () => Promise<void>;
  refreshSorties:   () => Promise<void>;
  refreshDashboard: () => Promise<void>;
  // Refresh tout après une entrée/sortie (met à jour dashboard + articles + la ressource)
  refreshAfterEntree: () => Promise<void>;
  refreshAfterSortie: () => Promise<void>;
}

const AppDataContext = createContext<AppData | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [articles,  setArticles]  = useState<Article[]>([]);
  const [entrees,   setEntrees]   = useState<Entree[]>([]);
  const [sorties,   setSorties]   = useState<Sortie[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  // Chargement initial — tout en parallèle
  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [a, e, s, d] = await Promise.all([
        articlesApi.list(),
        entreesApi.list(),
        sortiesApi.list(),
        dashboardApi.get(),
      ]);
      setArticles(a);
      setEntrees(e);
      setSorties(s);
      setDashboard(d);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Refreshs individuels
  const refreshArticles  = useCallback(async () => { setArticles(await articlesApi.list()); },  []);
  const refreshEntrees   = useCallback(async () => { setEntrees(await entreesApi.list()); },    []);
  const refreshSorties   = useCallback(async () => { setSorties(await sortiesApi.list()); },    []);
  const refreshDashboard = useCallback(async () => { setDashboard(await dashboardApi.get()); }, []);

  // Après une entrée : mettre à jour entrees + articles (stock_actuel) + dashboard
  const refreshAfterEntree = useCallback(async () => {
    const [e, a, d] = await Promise.all([
      entreesApi.list(),
      articlesApi.list(),
      dashboardApi.get(),
    ]);
    setEntrees(e);
    setArticles(a);
    setDashboard(d);
  }, []);

  // Après une sortie : mettre à jour sorties + articles (stock_actuel) + dashboard
  const refreshAfterSortie = useCallback(async () => {
    const [s, a, d] = await Promise.all([
      sortiesApi.list(),
      articlesApi.list(),
      dashboardApi.get(),
    ]);
    setSorties(s);
    setArticles(a);
    setDashboard(d);
  }, []);

  return (
    <AppDataContext.Provider value={{
      articles, entrees, sorties, dashboard,
      loading, error,
      refreshArticles, refreshEntrees, refreshSorties, refreshDashboard,
      refreshAfterEntree, refreshAfterSortie,
    }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData(): AppData {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData doit être utilisé dans AppDataProvider');
  return ctx;
}
