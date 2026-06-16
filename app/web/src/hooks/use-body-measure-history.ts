'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getBodyMeasureHistory, type LatestBodyMeasure } from '@/services/body-measure';
import { queryKeys } from '@/lib/query-keys';

export function useBodyMeasureHistory(_refreshKey?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.bodyMeasureHistory,
    queryFn: async () => {
      const { measures } = await getBodyMeasureHistory();
      return measures.filter(Boolean) as NonNullable<LatestBodyMeasure>[];
    },
    retry: 3,
  });

  async function reload() {
    await queryClient.invalidateQueries({ queryKey: queryKeys.bodyMeasureHistory });
  }

  return {
    measures: query.data ?? [],
    loading: query.isPending,
    error: query.isError ? 'Não foi possível carregar o histórico.' : null,
    reload,
  };
}
