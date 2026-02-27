import { useState, useEffect, useCallback } from 'react';
import { articlesApi } from '../api/articles';
import type { Article } from '../types/stock';

export function useArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await articlesApi.list();
      setArticles(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { articles, loading, error, refresh: fetch };
}
