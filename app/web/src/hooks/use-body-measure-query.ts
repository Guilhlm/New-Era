'use client';

import { useEffect, useMemo, useState } from 'react';
import { getLatestBodyMeasure, type LatestBodyMeasure } from '@/services/body-measure';
import { measureNum } from '@/utils/body-measure-drafts';
import { toDraftString } from '@/utils/number-draft';

export function useBodyMeasureQuery() {
  const [loadingHeader, setLoadingHeader] = useState(true);
  const [measureRecord, setMeasureRecord] = useState<LatestBodyMeasure | null>(null);
  const [saved, setSaved] = useState<{ weight: string; height: string; dateLabel: string }>({
    weight: '',
    height: '',
    dateLabel: '',
  });

  const measureSyncSignature = useMemo(() => {
    const m = measureRecord;
    if (!m?.id) return `none_${loadingHeader ? 'loading' : 'idle'}`;
    return `${m.id}_${m.updatedAt ?? ''}_${m.recordedAt ?? ''}`;
  }, [measureRecord, loadingHeader]);

  const currentWeightKg = useMemo(() => measureNum(saved.weight), [saved.weight]);

  useEffect(() => {
    let alive = true;
    const run = async () => {
      try {
        const { measure } = await getLatestBodyMeasure();
        if (!alive) return;

        const weight = toDraftString(measure?.weight);
        const height = toDraftString(measure?.height);
        const recordedAt = measure?.recordedAt ? new Date(measure.recordedAt) : null;
        const dateLabel = recordedAt
          ? recordedAt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
          : new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

        setSaved({ weight, height, dateLabel });
        setMeasureRecord(measure);
      } catch {
        if (!alive) return;
        const dateLabel = new Date().toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
        setSaved((s) => ({ ...s, dateLabel }));
      } finally {
        if (alive) setLoadingHeader(false);
      }
    };

    const id = window.setTimeout(() => {
      void run();
    }, 0);

    return () => {
      alive = false;
      window.clearTimeout(id);
    };
  }, []);

  return {
    loadingHeader,
    measureRecord,
    setMeasureRecord,
    saved,
    setSaved,
    measureSyncSignature,
    currentWeightKg,
  };
}

export type BodyMeasureQueryState = ReturnType<typeof useBodyMeasureQuery>;
