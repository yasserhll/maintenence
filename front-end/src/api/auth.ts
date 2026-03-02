import apiFetch from './client';

export interface UserInfo {
  id: number;
  name: string;
  email: string;
  role: 'superadmin' | 'admin' | 'user';
  site_id: number | null;
  site: { id: number; nom: string; slug: string } | null;
}

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<{ token: string; user: UserInfo }>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  logout: () => apiFetch<void>('/logout', { method: 'POST' }),
  me:     () => apiFetch<UserInfo>('/me'),
  changePassword: (current_password: string, new_password: string, new_password_confirmation: string) =>
    apiFetch<{ message: string }>('/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password, new_password, new_password_confirmation }),
    }),
};

export const adminApi = {
  // Sites
  listSites:   () => apiFetch<any[]>('/admin/sites'),
  createSite:  (data: any) => apiFetch<any>('/admin/sites', { method: 'POST', body: JSON.stringify(data) }),
  updateSite:  (id: number, data: any) => apiFetch<any>(`/admin/sites/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSite:  (id: number) => apiFetch<null>(`/admin/sites/${id}`, { method: 'DELETE' }),
  // Users
  listUsers:   () => apiFetch<any[]>('/admin/users'),
  createUser:  (data: any) => apiFetch<any>('/admin/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser:  (id: number, data: any) => apiFetch<any>(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser:  (id: number) => apiFetch<null>(`/admin/users/${id}`, { method: 'DELETE' }),
};
