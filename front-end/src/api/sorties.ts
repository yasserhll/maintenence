import apiFetch from './client';
import type { Sortie, SortiePayload } from '../types/stock';

export const sortiesApi = {
  list:   ()                    => apiFetch<Sortie[]>('/sorties'),
  create: (data: SortiePayload) => apiFetch<Sortie>('/sorties', { method: 'POST', body: JSON.stringify(data) }),
  remove: (id: number)          => apiFetch<null>(`/sorties/${id}`, { method: 'DELETE' }),
};
