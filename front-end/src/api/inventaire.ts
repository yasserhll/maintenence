import apiFetch from './client';
import type { Inventaire, SaveTrouvesPayload } from '../types/stock';

export const inventaireApi = {
  // Récupère l'inventaire unique (déjà calculé côté backend)
  get: () =>
    apiFetch<Inventaire>('/inventaire'),

  // Sauvegarde uniquement les stock_trouve saisis manuellement
  saveTrouves: (lignes: SaveTrouvesPayload[]) =>
    apiFetch<{ message: string }>('/inventaire/trouves', {
      method: 'POST',
      body: JSON.stringify({ lignes }),
    }),

  // Force un recalcul (rarement nécessaire)
  recalculer: () =>
    apiFetch<Inventaire>('/inventaire/recalculer', { method: 'POST' }),
};
