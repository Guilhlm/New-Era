'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useWorkoutDayQuery } from '@/hooks/use-workout-day-query';
import { useWorkoutExerciseDraft } from '@/hooks/use-workout-exercise-draft';
import { useWorkoutGroupMutations } from '@/hooks/use-workout-group-mutations';
import { toastAuthError, toastUpdated } from '@/lib/app-toast';
import { queryKeys } from '@/lib/query-keys';
import { copyWorkoutDay } from '@/services/workout';
import { HttpError } from '@/services/http';
import { CRUD_TOAST } from '@/utils/crud-toast-messages';
import { TRAINING_WEEKDAYS } from '@/utils/training-constants';

type UseTrainingGroupsStateParams = {
  selectedWeekday: number;
  onWeekdayChange?: (weekday: number) => void;
};

export function useTrainingGroupsState({ selectedWeekday }: UseTrainingGroupsStateParams) {
  const queryClient = useQueryClient();
  const dayQuery = useWorkoutDayQuery({ selectedWeekday });
  const [saving, setSaving] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [copyDayOpen, setCopyDayOpen] = useState(false);

  const groupMutations = useWorkoutGroupMutations({
    plan: dayQuery.data.plan,
    setPlan: dayQuery.actions.setPlan,
    selectedWeekday,
    setSaving,
    createGroupOpen,
    setCreateGroupOpen,
  });

  const exerciseDraft = useWorkoutExerciseDraft({
    plan: dayQuery.data.plan,
    setPlan: dayQuery.actions.setPlan,
    setSaving,
  });

  async function copyDay(targetWeekday: number | 'all') {
    const sourceWeekday = dayQuery.data.selectedWeekday;
    if (targetWeekday === sourceWeekday) {
      setCopyDayOpen(false);
      return;
    }

    const targetWeekdays =
      targetWeekday === 'all'
        ? TRAINING_WEEKDAYS.filter((day) => day.index !== sourceWeekday).map((day) => day.index)
        : [targetWeekday];

    setSaving(true);
    try {
      const copiedDays = await Promise.all(
        targetWeekdays.map(async (weekday) => {
          const { plan } = await copyWorkoutDay({ sourceWeekday, targetWeekday: weekday });
          return { weekday, plan };
        }),
      );

      for (const day of copiedDays) {
        dayQuery.actions.setPlanForDay(day.weekday, day.plan);
      }

      await queryClient.invalidateQueries({ queryKey: queryKeys.workoutPlan });
      toastUpdated(CRUD_TOAST.workoutDayCopied);
      setCopyDayOpen(false);
    } catch (error) {
      toastAuthError(error instanceof HttpError ? error.message : 'Could not copy workout day.');
    } finally {
      setSaving(false);
    }
  }

  return {
    data: {
      weekdayLabel: dayQuery.data.weekdayLabel,
      weekdayShortLabel: dayQuery.data.weekdayShortLabel,
      plan: dayQuery.data.plan,
      groups: dayQuery.data.groups,
      editExercise: exerciseDraft.data.editExercise,
      selectedWeekday: dayQuery.data.selectedWeekday,
    },
    actions: {
      loadDay: dayQuery.actions.loadDay,
      openCopyDay: () => setCopyDayOpen(true),
      closeCopyDay: () => setCopyDayOpen(false),
      copyDay,
      ...groupMutations.actions,
      ...exerciseDraft.actions,
      setNotesDraft: dayQuery.actions.setNotesDraft,
      applySavedNotes: dayQuery.actions.applySavedNotes,
      applySavedPlanTitle: dayQuery.actions.applySavedPlanTitle,
    },
    ui: {
      loading: dayQuery.ui.loading,
      saving,
      createGroupOpen,
      copyDayOpen,
    },
  };
}

export type TrainingGroupsState = ReturnType<typeof useTrainingGroupsState>;
