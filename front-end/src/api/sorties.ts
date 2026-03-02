import apiFetch from './client';
import type { Sortie, SortiePayload } from '../types/stock';

const q = (siteId?: number) => siteId ? `?site_id=${siteId}` : '';

export const sortiesApi = {
  list:   (siteId?: number)                         => apiFetch<Sortie[]>(`/sorties${q(siteId)}`),
  create: (data: SortiePayload, siteId?: number)    => apiFetch<Sortie>(`/sorties${q(siteId)}`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<SortiePayload>) => apiFetch<Sortie>(`/sorties/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: number)                              => apiFetch<null>(`/sorties/${id}`, { method: 'DELETE' }),
};
