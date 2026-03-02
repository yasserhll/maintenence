const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1';

export function getToken(): string | null {
  return localStorage.getItem('gmao_token');
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem('gmao_token', token);
  else localStorage.removeItem('gmao_token');
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { headers, ...options });

  if (res.status === 401) {
    setToken(null);
    window.location.href = '/login';
    throw new Error('Session expirée');
  }
  if (res.status === 204) return null as T;
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message ?? `Erreur ${res.status}`);
  return json as T;
}

export default apiFetch;
