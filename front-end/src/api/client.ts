const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    ...options,
  });
  if (res.status === 204) return null as T;
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message ?? `Erreur ${res.status}`);
  return json as T;
}

export default apiFetch;
