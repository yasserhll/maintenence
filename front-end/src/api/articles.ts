import apiFetch from './client';
import type { Article } from '../types/stock';

const q = (siteId?: number) => siteId ? `?site_id=${siteId}` : '';

export const articlesApi = {
  list:   (siteId?: number)               => apiFetch<Article[]>(`/articles${q(siteId)}`),
  create: (data: any, siteId?: number)    => apiFetch<Article>(`/articles${q(siteId)}`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any)         => apiFetch<Article>(`/articles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: number)                    => apiFetch<null>(`/articles/${id}`, { method: 'DELETE' }),
};
