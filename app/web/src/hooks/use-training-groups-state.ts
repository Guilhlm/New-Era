'use client';

import { useState } from 'react';
import { useWorkoutDayQuery } from '@/hooks/use-workout-day-query';
import { useWorkoutExerciseDraft } from '@/hooks/use-workout-exercise-draft';
import { useWorkoutGroupMutations } from '@/hooks/use-workout-group-mutations';

type UseTrainingGroupsStateParams = {
  selectedWeekday: number;
  onWeekdayChange?: (weekday: number) => void;
};

export function useTrainingGroupsState({ selectedWeekday }: UseTrainingGroupsStateParams) {
  const dayQuery = useWorkoutDayQuery({ selectedWeekday });
  const [saving, setSaving] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);

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
    },
  };
}

export type TrainingGroupsState = ReturnType<typeof useTrainingGroupsState>;
