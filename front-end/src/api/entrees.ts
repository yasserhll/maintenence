import apiFetch from './client';
import type { Entree, EntreePayload } from '../types/stock';

export const entreesApi = {
  list:   ()                    => apiFetch<Entree[]>('/entrees'),
  create: (data: EntreePayload) => apiFetch<Entree>('/entrees', { method: 'POST', body: JSON.stringify(data) }),
  remove: (id: number)          => apiFetch<null>(`/entrees/${id}`, { method: 'DELETE' }),
};
