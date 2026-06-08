'use client';

import { useCallback, useEffect, useState } from 'react';
import { getBodyMeasureHistory, type LatestBodyMeasure } from '@/services/body-measure';

export function useBodyMeasureHistory(refreshKey: string) {
  const [measures, setMeasures] = useState<NonNullable<LatestBodyMeasure>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { measures: next } = await getBodyMeasureHistory();
      setMeasures(next.filter(Boolean));
    } catch {
      setMeasures([]);
      setError('Não foi possível carregar o histórico.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload, refreshKey]);

  return { measures, loading, error, reload };
}
