import apiFetch from './client';
import type { DashboardData } from '../types/stock';

export const dashboardApi = {
  get: (siteId?: number) => apiFetch<DashboardData>(`/dashboard${siteId ? `?site_id=${siteId}` : ''}`),
};
