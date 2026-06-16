'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { toastAuthError } from '@/lib/app-toast';
import { queryKeys } from '@/lib/query-keys';
import { getTasksSummary } from '@/services/task';
import { HttpError } from '@/services/http';

const EMPTY_COUNTS = Array.from({ length: 7 }, (_, weekday) => ({ weekday, count: 0 }));

export function useTaskWeekdaySummary() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.taskWeekdaySummary,
    queryFn: getTasksSummary,
    select: (data) => data.days,
    retry: 3,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!query.isError) return;
    const message =
      query.error instanceof HttpError ? query.error.message : 'Could not load weekday summary.';
    toastAuthError(message);
  }, [query.isError, query.error]);

  const days = query.data ?? EMPTY_COUNTS;

  const loadSummary = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.taskWeekdaySummary });
  }, [queryClient]);

  function countForWeekday(weekday: number) {
    return days.find((day) => day.weekday === weekday)?.count ?? 0;
  }

  return {
    data: { days },
    actions: { loadSummary, countForWeekday },
    ui: { loading: query.isPending },
  };
}
