import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { adminApi } from '../api/auth';
import { useAuth } from './AuthContext';

export interface SiteOption {
  id: number;
  nom: string;
  slug: string;
  actif: boolean;
  users_count?: number;
}

interface SiteContextType {
  sites: SiteOption[];
  activeSite: SiteOption | null;
  setActiveSite: (s: SiteOption) => void;
  activeSiteId: number | null; // null = user's own site (non-superadmin)
}

const SiteContext = createContext<SiteContextType>(null!);
export const useSite = () => useContext(SiteContext);

export function SiteProvider({ children }: { children: ReactNode }) {
  const { isSuperAdmin, user } = useAuth();
  const [sites, setSites]           = useState<SiteOption[]>([]);
  const [activeSite, setActiveSiteState] = useState<SiteOption | null>(null);

  // Superadmin : charger la liste des sites au démarrage
  useEffect(() => {
    if (!isSuperAdmin) return;
    adminApi.listSites().then(s => {
      const actifs = s.filter((x: SiteOption) => x.actif !== false);
      setSites(actifs);
      // Restaurer le site sélectionné depuis localStorage
      const saved = localStorage.getItem('gmao_active_site');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const match = actifs.find((x: SiteOption) => x.id === parsed.id);
          if (match) { setActiveSiteState(match); return; }
        } catch {}
      }
      // Par défaut : premier site
      if (actifs.length > 0) setActiveSiteState(actifs[0]);
    }).catch(() => {});
  }, [isSuperAdmin]);

  const setActiveSite = (s: SiteOption) => {
    setActiveSiteState(s);
    localStorage.setItem('gmao_active_site', JSON.stringify(s));
  };

  // Pour un user normal, activeSiteId = son site_id
  const activeSiteId = isSuperAdmin
    ? activeSite?.id ?? null
    : user?.site_id ?? null;

  return (
    <SiteContext.Provider value={{ sites, activeSite, setActiveSite, activeSiteId }}>
      {children}
    </SiteContext.Provider>
  );
}
