'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getBodyVitalHistory, type LatestBodyVital } from '@/services/body-measure';
import { queryKeys } from '@/lib/query-keys';

export function useBodyVitalHistory(_refreshKey?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.bodyVitalHistory,
    queryFn: async () => {
      const { vitals } = await getBodyVitalHistory();
      return vitals.filter(Boolean) as NonNullable<LatestBodyVital>[];
    },
    retry: 3,
  });

  async function reload() {
    await queryClient.invalidateQueries({ queryKey: queryKeys.bodyVitalHistory });
  }

  return {
    vitals: query.data ?? [],
    loading: query.isPending,
    error: query.isError ? 'Não foi possível carregar o histórico de vitals.' : null,
    reload,
  };
}
