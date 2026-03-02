import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { articlesApi }  from '../api/articles';
import { entreesApi }   from '../api/entrees';
import { sortiesApi }   from '../api/sorties';
import { dashboardApi } from '../api/dashboard';
import { useSite }      from './SiteContext';
import type { Article, Entree, Sortie, DashboardData } from '../types/stock';

interface AppDataContextType {
  articles:  Article[];
  entrees:   Entree[];
  sorties:   Sortie[];
  dashboard: DashboardData | null;
  loading:   boolean;
  error:     string | null;
  refreshAll:          () => void;
  refreshArticles:     () => void;
  refreshAfterEntree:  () => void;
  refreshAfterSortie:  () => void;
  optimisticAddArticle:    (a: Article) => void;
  optimisticUpdateArticle: (a: Article) => void;
  optimisticRemoveArticle: (id: number) => void;
  optimisticAddEntree:     (e: Entree, article: Article) => void;
  optimisticRemoveEntree:  (id: number, articleId: number, qty: number) => void;
  optimisticAddSortie:     (s: Sortie, article: Article) => void;
  optimisticRemoveSortie:  (id: number, articleId: number, qty: number) => void;
}

const AppDataContext = createContext<AppDataContextType>(null!);
export const useAppData = () => useContext(AppDataContext);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { activeSiteId } = useSite();

  const [articles,  setArticles]  = useState<Article[]>([]);
  const [entrees,   setEntrees]   = useState<Entree[]>([]);
  const [sorties,   setSorties]   = useState<Sortie[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  // Recharger toutes les données quand le site actif change
  useEffect(() => { loadAll(); }, [activeSiteId]);

  // Construire les query params selon le site
  const siteParam = activeSiteId ? `?site_id=${activeSiteId}` : '';

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [a, e, s, d] = await Promise.all([
        articlesApi.list(activeSiteId ?? undefined),
        entreesApi.list(activeSiteId ?? undefined),
        sortiesApi.list(activeSiteId ?? undefined),
        dashboardApi.get(activeSiteId ?? undefined),
      ]);
      setArticles(a); setEntrees(e); setSorties(s); setDashboard(d);
    } catch (err: any) {
      setError(err.message ?? 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const refreshAll        = () => loadAll();
  const refreshArticles   = () => Promise.all([
    articlesApi.list(activeSiteId ?? undefined),
    dashboardApi.get(activeSiteId ?? undefined),
  ]).then(([a, d]) => { setArticles(a); setDashboard(d); }).catch(() => {});

  const refreshAfterEntree = () => Promise.all([
    articlesApi.list(activeSiteId ?? undefined),
    entreesApi.list(activeSiteId ?? undefined),
    dashboardApi.get(activeSiteId ?? undefined),
  ]).then(([a, e, d]) => { setArticles(a); setEntrees(e); setDashboard(d); }).catch(() => {});

  const refreshAfterSortie = () => Promise.all([
    articlesApi.list(activeSiteId ?? undefined),
    sortiesApi.list(activeSiteId ?? undefined),
    dashboardApi.get(activeSiteId ?? undefined),
  ]).then(([a, s, d]) => { setArticles(a); setSorties(s); setDashboard(d); }).catch(() => {});

  const optimisticAddArticle    = (a: Article) => setArticles(p => [...p, a]);
  const optimisticUpdateArticle = (a: Article) => setArticles(p => p.map(x => x.id === a.id ? a : x));
  const optimisticRemoveArticle = (id: number) => setArticles(p => p.filter(x => x.id !== id));

  const optimisticAddEntree = (e: Entree, article: Article) => {
    setEntrees(p => [e, ...p]);
    setArticles(p => p.map(a => a.id === article.id ? { ...a, stock_actuel: a.stock_actuel + e.quantite } : a));
  };
  const optimisticRemoveEntree = (id: number, articleId: number, qty: number) => {
    setEntrees(p => p.filter(e => e.id !== id));
    setArticles(p => p.map(a => a.id === articleId ? { ...a, stock_actuel: a.stock_actuel - qty } : a));
  };
  const optimisticAddSortie = (s: Sortie, article: Article) => {
    setSorties(p => [s, ...p]);
    setArticles(p => p.map(a => a.id === article.id ? { ...a, stock_actuel: Math.max(0, a.stock_actuel - s.quantite) } : a));
  };
  const optimisticRemoveSortie = (id: number, articleId: number, qty: number) => {
    setSorties(p => p.filter(s => s.id !== id));
    setArticles(p => p.map(a => a.id === articleId ? { ...a, stock_actuel: a.stock_actuel + qty } : a));
  };

  return (
    <AppDataContext.Provider value={{
      articles, entrees, sorties, dashboard, loading, error,
      refreshAll, refreshArticles, refreshAfterEntree, refreshAfterSortie,
      optimisticAddArticle, optimisticUpdateArticle, optimisticRemoveArticle,
      optimisticAddEntree, optimisticRemoveEntree,
      optimisticAddSortie, optimisticRemoveSortie,
    }}>
      {children}
    </AppDataContext.Provider>
  );
}
