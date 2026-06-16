'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { useWeekdayNavigation } from '@/hooks/use-weekday-navigation';
import { toastAuthError } from '@/lib/app-toast';
import { queryKeys } from '@/lib/query-keys';
import { getTasksDay } from '@/services/task';
import { HttpError } from '@/services/http';
import type { TaskVm } from '@/types/task';
import { WEEKDAYS } from '@/utils/weekdays';

export function useTaskDayQuery() {
  const queryClient = useQueryClient();
  const { selectedWeekday, prevDay, nextDay, selectWeekday } = useWeekdayNavigation();

  const weekday = WEEKDAYS.find((day) => day.index === selectedWeekday);

  const query = useQuery({
    queryKey: queryKeys.taskDay(selectedWeekday),
    queryFn: async () => {
      const { tasks: nextTasks } = await getTasksDay(selectedWeekday);
      return nextTasks;
    },
    retry: 3,
  });

  useEffect(() => {
    if (!query.isError) return;
    const message = query.error instanceof HttpError ? query.error.message : 'Could not load tasks.';
    toastAuthError(message);
  }, [query.isError, query.error]);

  const tasks = query.data ?? [];

  const setTasks = useCallback(
    (next: TaskVm[] | ((prev: TaskVm[]) => TaskVm[])) => {
      queryClient.setQueryData<TaskVm[]>(queryKeys.taskDay(selectedWeekday), (prev) => {
        const base = prev ?? [];
        return typeof next === 'function' ? next(base) : next;
      });
    },
    [queryClient, selectedWeekday],
  );

  const loadDay = useCallback(
    async (weekdayIndex: number) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.taskDay(weekdayIndex) });
    },
    [queryClient],
  );

  return {
    data: {
      selectedWeekday,
      weekdayLabel: weekday?.label ?? 'Sunday',
      weekdayShortLabel: weekday?.shortLabel ?? 'Sun',
      tasks,
    },
    actions: {
      setTasks,
      loadDay,
      prevDay,
      nextDay,
      selectWeekday,
    },
    ui: {
      loading: query.isPending,
    },
  };
}
