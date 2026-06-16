'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { queryKeys } from '@/lib/query-keys';
import { getLatestBodyMeasure, type LatestBodyMeasure } from '@/services/body-measure';
import { measureNum } from '@/utils/body-measure-drafts';
import { toDraftString } from '@/utils/number-draft';

export function useBodyMeasureQuery() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.bodyMeasureLatest,
    queryFn: getLatestBodyMeasure,
    select: (data) => data.measure,
    retry: 3,
  });

  const measureRecord = query.data ?? null;

  const saved = useMemo(() => {
    const weight = toDraftString(measureRecord?.weight);
    const height = toDraftString(measureRecord?.height);
    const recordedAt = measureRecord?.recordedAt ? new Date(measureRecord.recordedAt) : null;
    const dateLabel = recordedAt
      ? recordedAt.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      : new Date().toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
    return { weight, height, dateLabel };
  }, [measureRecord]);

  const measureSyncSignature = useMemo(() => {
    const m = measureRecord;
    if (!m?.id) return `none_${query.isPending ? 'loading' : 'idle'}`;
    return `${m.id}_${m.updatedAt ?? ''}_${m.recordedAt ?? ''}`;
  }, [measureRecord, query.isPending]);

  const currentWeightKg = useMemo(() => measureNum(saved.weight), [saved.weight]);

  function setMeasureRecord(measure: LatestBodyMeasure | null) {
    queryClient.setQueryData(queryKeys.bodyMeasureLatest, { measure });
  }

  return {
    loadingHeader: query.isPending,
    measureRecord,
    setMeasureRecord,
    saved,
    measureSyncSignature,
    currentWeightKg,
  };
}

export type BodyMeasureQueryState = ReturnType<typeof useBodyMeasureQuery>;
