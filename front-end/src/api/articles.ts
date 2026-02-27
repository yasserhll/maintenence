import apiFetch from './client';
import type { Article } from '../types/stock';

export const articlesApi = {
  list:   ()           => apiFetch<Article[]>('/articles'),
  create: (data: any)  => apiFetch<Article>('/articles', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => apiFetch<Article>(`/articles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: number) => apiFetch<null>(`/articles/${id}`, { method: 'DELETE' }),
};
