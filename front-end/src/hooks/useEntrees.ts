import { useState, useEffect, useCallback } from 'react';
import { entreesApi } from '../api/entrees';
import type { Entree } from '../types/stock';

export function useEntrees() {
  const [entrees, setEntrees] = useState<Entree[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await entreesApi.list();
      setEntrees(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { entrees, loading, error, refresh: fetch };
}
