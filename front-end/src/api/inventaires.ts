import apiFetch from './client';
import type { Inventaire, InventairePayload, LigneInventairePrepared } from '../types/stock';

export const inventairesApi = {
  list: () =>
    apiFetch<Inventaire[]>('/inventaires'),

  prepare: () =>
    apiFetch<LigneInventairePrepared[]>('/inventaires/prepare'),

  create: (data: InventairePayload) =>
    apiFetch<Inventaire>('/inventaires', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  remove: (id: number) =>
    apiFetch<null>(`/inventaires/${id}`, { method: 'DELETE' }),
};
