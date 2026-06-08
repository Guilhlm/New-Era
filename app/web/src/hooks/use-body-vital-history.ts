'use client';

import { useCallback, useEffect, useState } from 'react';
import { getBodyVitalHistory, type LatestBodyVital } from '@/services/body-measure';

export function useBodyVitalHistory(refreshKey: string) {
  const [vitals, setVitals] = useState<NonNullable<LatestBodyVital>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { vitals: next } = await getBodyVitalHistory();
      setVitals(next.filter(Boolean));
    } catch {
      setVitals([]);
      setError('Não foi possível carregar o histórico de vitals.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload, refreshKey]);

  return { vitals, loading, error, reload };
}
