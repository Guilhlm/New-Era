'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { useWeekdayNavigation } from '@/hooks/use-weekday-navigation';
import { toastAuthError } from '@/lib/app-toast';
import { queryKeys } from '@/lib/query-keys';
import { getDietDay } from '@/services/diet';
import { HttpError } from '@/services/http';
import type { DietMealVm } from '@/types/diet';
import { DIET_WEEKDAYS } from '@/utils/diet-constants';

export function useDietDayQuery() {
  const queryClient = useQueryClient();
  const { selectedWeekday, prevDay, nextDay, selectWeekday } = useWeekdayNavigation();

  const weekday = DIET_WEEKDAYS.find((day) => day.index === selectedWeekday);

  const query = useQuery({
    queryKey: queryKeys.dietDay(selectedWeekday),
    queryFn: async () => {
      const { meals: nextMeals } = await getDietDay(selectedWeekday);
      return nextMeals.map((meal) => ({ ...meal, expanded: false, draft: null }));
    },
    retry: 3,
  });

  useEffect(() => {
    if (!query.isError) return;
    const message =
      query.error instanceof HttpError ? query.error.message : 'Could not load diet day.';
    toastAuthError(message);
  }, [query.isError, query.error]);

  const meals = query.data ?? [];

  const setMeals = useCallback(
    (next: DietMealVm[] | ((prev: DietMealVm[]) => DietMealVm[])) => {
      queryClient.setQueryData<DietMealVm[]>(queryKeys.dietDay(selectedWeekday), (prev) => {
        const base = prev ?? [];
        return typeof next === 'function' ? next(base) : next;
      });
    },
    [queryClient, selectedWeekday],
  );

  const loadDay = useCallback(
    async (weekdayIndex: number) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.dietDay(weekdayIndex) });
    },
    [queryClient],
  );

  const setMealsForDay = useCallback(
    (weekdayIndex: number, nextMeals: DietMealVm[]) => {
      queryClient.setQueryData<DietMealVm[]>(
        queryKeys.dietDay(weekdayIndex),
        nextMeals.map((meal) => ({ ...meal, expanded: false, draft: null })),
      );
    },
    [queryClient],
  );

  return {
    data: {
      selectedWeekday,
      weekdayLabel: weekday?.label ?? 'Monday',
      weekdayShortLabel: weekday?.shortLabel ?? 'Mon',
      meals,
    },
    actions: {
      setMeals,
      setMealsForDay,
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
