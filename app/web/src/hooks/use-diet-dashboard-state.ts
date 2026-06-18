'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getCalendarWeekday } from '@/hooks/use-calendar-day-change';
import { useDietMacroView } from '@/hooks/use-diet-macro-view';
import { useDietMealsState } from '@/hooks/use-diet-meals-state';
import { mergeTasksForDietDay } from '@/lib/invalidate-task-caches';
import { queryKeys } from '@/lib/query-keys';
import { getTasksDay, getTasksToday } from '@/services/task';

export function useDietDashboardState() {
  const mealsState = useDietMealsState();
  const selectedWeekday = mealsState.data.selectedWeekday;
  const isToday = selectedWeekday === getCalendarWeekday();

  const tasksQuery = useQuery({
    queryKey: queryKeys.taskDay(selectedWeekday),
    queryFn: async () => {
      const { tasks } = await getTasksDay(selectedWeekday);
      return tasks;
    },
    retry: 3,
  });

  const todayTasksQuery = useQuery({
    queryKey: queryKeys.tasksToday,
    queryFn: getTasksToday,
    enabled: isToday,
    retry: 3,
  });

  const dietTasks = useMemo(
    () => mergeTasksForDietDay(selectedWeekday, tasksQuery.data, todayTasksQuery.data),
    [selectedWeekday, tasksQuery.data, todayTasksQuery.data],
  );

  const macroView = useDietMacroView(mealsState.data.meals, dietTasks);

  return {
    data: {
      header: {
        title: 'Diet Plan',
        weekdayLabel: mealsState.data.weekdayLabel,
        weekdayShortLabel: mealsState.data.weekdayShortLabel,
        macroSummaries: macroView.macroSummaries,
      },
      meals: mealsState.data.meals,
      editItem: mealsState.data.editItem,
      dailyMacros: macroView.dailyMacros,
      selectedWeekday,
    },
    actions: mealsState.actions,
    ui: {
      ...mealsState.ui,
      tasksLoading: tasksQuery.isPending || (isToday && todayTasksQuery.isPending),
    },
  };
}

export type DietDashboardState = ReturnType<typeof useDietDashboardState>;
