'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { toastAuthError } from '@/lib/app-toast';
import { queryKeys } from '@/lib/query-keys';
import { getWorkoutDay } from '@/services/workout';
import { HttpError } from '@/services/http';
import type { TrainingDayPlanVm } from '@/types/training';
import { TRAINING_WEEKDAYS } from '@/utils/training-constants';

function emptyPlan(weekday: number): TrainingDayPlanVm {
  return {
    id: null,
    weekday,
    title: 'Rest Day',
    sheetTitle: null,
    isActive: false,
    notes: null,
    groups: [],
  };
}

function toPlanVm(plan: TrainingDayPlanVm): TrainingDayPlanVm {
  return {
    ...plan,
    groups: Array.isArray(plan.groups)
      ? plan.groups.map((group) => ({ ...group, expanded: false, draft: null }))
      : [],
  };
}

type UseWorkoutDayQueryParams = {
  selectedWeekday: number;
};

export function useWorkoutDayQuery({ selectedWeekday }: UseWorkoutDayQueryParams) {
  const queryClient = useQueryClient();
  const weekday = TRAINING_WEEKDAYS.find((day) => day.index === selectedWeekday);

  const query = useQuery({
    queryKey: queryKeys.workoutDay(selectedWeekday),
    queryFn: async () => {
      const { plan: nextPlan } = await getWorkoutDay(selectedWeekday);
      return toPlanVm(nextPlan);
    },
    retry: 3,
  });

  useEffect(() => {
    if (!query.isError) return;
    const message =
      query.error instanceof HttpError ? query.error.message : 'Could not load workout day.';
    toastAuthError(message);
  }, [query.isError, query.error]);

  const plan = query.data ?? emptyPlan(selectedWeekday);

  const setPlan = useCallback(
    (next: TrainingDayPlanVm | ((prev: TrainingDayPlanVm) => TrainingDayPlanVm)) => {
      queryClient.setQueryData<TrainingDayPlanVm>(
        queryKeys.workoutDay(selectedWeekday),
        (prev) => {
          const base = prev ?? emptyPlan(selectedWeekday);
          return typeof next === 'function'
            ? (next as (prev: TrainingDayPlanVm) => TrainingDayPlanVm)(base)
            : next;
        },
      );
    },
    [queryClient, selectedWeekday],
  );

  const loadDay = useCallback(
    async (weekdayIndex: number) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.workoutDay(weekdayIndex) });
    },
    [queryClient],
  );

  function applySavedNotes(notes: string | null) {
    setPlan((prev) => ({ ...prev, notes }));
  }

  function applySavedPlanTitle(title: string) {
    setPlan((prev) => ({
      ...prev,
      title,
      sheetTitle: title,
      isActive: true,
    }));
  }

  function setNotesDraft(notes: string) {
    setPlan((prev) => ({ ...prev, notes }));
  }

  return {
    data: {
      plan,
      groups: plan.groups,
      weekdayLabel: weekday?.label ?? 'Monday',
      weekdayShortLabel: weekday?.shortLabel ?? 'Mon',
      selectedWeekday,
    },
    actions: {
      setPlan,
      loadDay,
      setNotesDraft,
      applySavedNotes,
      applySavedPlanTitle,
    },
    ui: {
      loading: query.isPending,
    },
  };
}
