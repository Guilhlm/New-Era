'use client';

import { useMemo, useCallback, useState } from 'react';
import { useTrainingGroupsState } from '@/hooks/use-training-groups-state';
import { useTrainingPlanSidebar } from '@/hooks/use-training-plan-sidebar';
import { buildTrainingDaySummary } from '@/utils/training-day-summary';

export function useTrainingDashboardState() {
  const [selectedWeekday, setSelectedWeekday] = useState(1);
  const groupsState = useTrainingGroupsState({ selectedWeekday });

  const handleNotesSaved = useCallback(
    (notes: string | null) => {
      groupsState.actions.applySavedNotes(notes);
    },
    [groupsState.actions],
  );

  const handlePlanTitleSaved = useCallback(
    (title: string) => {
      groupsState.actions.applySavedPlanTitle(title);
    },
    [groupsState.actions],
  );

  const handleDayModeChanged = useCallback(
    (weekday: number) => {
      void groupsState.actions.loadDay(weekday);
    },
    [groupsState.actions],
  );

  const sidebarState = useTrainingPlanSidebar({
    selectedWeekday,
    onSelectWeekday: setSelectedWeekday,
    notes: groupsState.data.plan.notes,
    onNotesSaved: handleNotesSaved,
    planTitle: groupsState.data.plan.sheetTitle ?? groupsState.data.plan.title,
    onPlanTitleSaved: handlePlanTitleSaved,
    onDayModeChanged: handleDayModeChanged,
  });

  const daySummary = useMemo(
    () => buildTrainingDaySummary(groupsState.data.groups, groupsState.data.plan.isActive),
    [groupsState.data.groups, groupsState.data.plan.isActive],
  );

  return {
    data: {
      header: {
        title: 'Workout Plan',
        weekdayLabel: groupsState.data.weekdayLabel,
        planTitle: groupsState.data.plan.title,
        isActive: groupsState.data.plan.isActive,
        summary: daySummary,
      },
      groups: groupsState.data.groups,
      plan: groupsState.data.plan,
      sidebarDays: sidebarState.data.sidebarDays,
      notesDraft: sidebarState.data.notesDraft,
      editExercise: groupsState.data.editExercise,
      weekdayLabel: groupsState.data.weekdayLabel,
    },
    actions: {
      ...groupsState.actions,
      ...sidebarState.actions,
    },
    ui: {
      ...groupsState.ui,
      sidebarLoading: sidebarState.ui.loading,
      sidebarSaving: sidebarState.ui.saving,
      selectedWeekday,
      editPlanOpen: sidebarState.data.editPlanOpen,
    },
  };
}

export type TrainingDashboardState = ReturnType<typeof useTrainingDashboardState>;
