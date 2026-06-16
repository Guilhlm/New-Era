'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { toastAuthError } from '@/lib/app-toast';
import { queryKeys } from '@/lib/query-keys';
import { getTaskDisciplineHistory } from '@/services/task';
import { HttpError } from '@/services/http';
import type {
  TaskDisciplineChartPeriod,
  TaskDisciplineChartTab,
} from '@/types/task';
import type { ChartTab, Period } from '@/types/profile';

type UseTaskDisciplineChartOptions = {
  days?: TaskDisciplineChartPeriod;
  tab?: TaskDisciplineChartTab;
  fixedPeriod?: boolean;
};

/**
 * Discipline history chart backed by React Query. Each chart fetches its own
 * data on mount (resilient to F5) and is kept in sync across pages through
 * the shared query cache: toggling a task patches/invalidates these keys.
 */
export function useTaskDisciplineChart(options: UseTaskDisciplineChartOptions = {}) {
  const [chartTab, setChartTab] = useState<ChartTab>('training');
  const [period, setPeriod] = useState<Period>(options.days ?? 7);

  const effectiveTab: TaskDisciplineChartTab =
    options.tab ?? (chartTab === 'financial' ? 'financial' : 'training');
  const effectivePeriod = (options.fixedPeriod ? (options.days ?? 7) : period) as TaskDisciplineChartPeriod;

  const query = useQuery({
    queryKey: queryKeys.discipline(effectiveTab, effectivePeriod),
    queryFn: async () => {
      const { days } = await getTaskDisciplineHistory(effectivePeriod, effectiveTab);
      return days;
    },
    enabled: effectiveTab !== 'financial',
    placeholderData: keepPreviousData,
    retry: 3,
  });

  useEffect(() => {
    if (!query.isError) return;
    const message =
      query.error instanceof HttpError
        ? query.error.message
        : 'Could not load discipline history.';
    toastAuthError(message);
  }, [query.isError, query.error]);

  const days = useMemo(
    () => (Array.isArray(query.data) ? query.data : []),
    [query.data],
  );
  const heights = useMemo(() => days.map((day) => day.percent), [days]);
  const labels = useMemo(() => days.map((day) => day.label), [days]);
  const weekAverage = useMemo(() => {
    if (days.length === 0) return 0;
    const sum = days.reduce((total, day) => total + day.percent, 0);
    return Math.round(sum / days.length);
  }, [days]);

  return {
    chartTab,
    setChartTab,
    period,
    setPeriod,
    heights,
    labels,
    days,
    weekAverage,
    loading: query.isPending,
    reload: () => query.refetch(),
  };
}

export type TaskDisciplineChartState = ReturnType<typeof useTaskDisciplineChart>;
