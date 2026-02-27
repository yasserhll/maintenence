import { useState, useEffect, useCallback } from 'react';
import { sortiesApi } from '../api/sorties';
import type { Sortie } from '../types/stock';

export function useSorties() {
  const [sorties, setSorties] = useState<Sortie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await sortiesApi.list();
      setSorties(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { sorties, loading, error, refresh: fetch };
}
