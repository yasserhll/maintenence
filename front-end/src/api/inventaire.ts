import apiFetch from './client';
import type { Inventaire, SaveTrouvesPayload } from '../types/stock';

export const inventaireApi = {
  get: (siteId?: number) =>
    apiFetch<Inventaire>(`/inventaire${siteId ? `?site_id=${siteId}` : ''}`),

  saveTrouves: (lignes: SaveTrouvesPayload[], siteId?: number) =>
    apiFetch<{ message: string }>(`/inventaire/trouves${siteId ? `?site_id=${siteId}` : ''}`, {
      method: 'POST',
      body: JSON.stringify({ lignes }),
    }),

  recalculer: (siteId?: number) =>
    apiFetch<Inventaire>(`/inventaire/recalculer${siteId ? `?site_id=${siteId}` : ''}`, { method: 'POST' }),
};
