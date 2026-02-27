import apiFetch from './client';
import type { DashboardData } from '../types/stock';

export const dashboardApi = {
  get: () => apiFetch<DashboardData>('/dashboard'),
};
