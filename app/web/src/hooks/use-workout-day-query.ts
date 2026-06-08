'use client';

import { useCallback, useEffect, useState } from 'react';
import { toastAuthError } from '@/lib/app-toast';
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

type UseWorkoutDayQueryParams = {
  selectedWeekday: number;
};

export function useWorkoutDayQuery({ selectedWeekday }: UseWorkoutDayQueryParams) {
  const [plan, setPlan] = useState<TrainingDayPlanVm>(emptyPlan(selectedWeekday));
  const [loading, setLoading] = useState(false);

  const weekday = TRAINING_WEEKDAYS.find((day) => day.index === selectedWeekday);

  const loadDay = useCallback(async (weekdayIndex: number) => {
    setLoading(true);
    try {
      const { plan: nextPlan } = await getWorkoutDay(weekdayIndex);
      setPlan({
        ...nextPlan,
        groups: nextPlan.groups.map((group) => ({
          ...group,
          expanded: false,
          draft: null,
        })),
      });
    } catch (error) {
      const message = error instanceof HttpError ? error.message : 'Could not load workout day.';
      toastAuthError(message);
      setPlan(emptyPlan(weekdayIndex));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDay(selectedWeekday);
  }, [loadDay, selectedWeekday]);

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
      loading,
    },
  };
}
