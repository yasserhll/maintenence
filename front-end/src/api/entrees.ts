import apiFetch from './client';
import type { Entree, EntreePayload } from '../types/stock';

const q = (siteId?: number) => siteId ? `?site_id=${siteId}` : '';

export const entreesApi = {
  list:   (siteId?: number)                         => apiFetch<Entree[]>(`/entrees${q(siteId)}`),
  create: (data: EntreePayload, siteId?: number)    => apiFetch<Entree>(`/entrees${q(siteId)}`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<EntreePayload>) => apiFetch<Entree>(`/entrees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: number)                              => apiFetch<null>(`/entrees/${id}`, { method: 'DELETE' }),
};
