'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toastAuthError, toastUpdated } from '@/lib/app-toast';
import { getWorkoutPlanSummary, updateWorkoutDay } from '@/services/workout';
import { HttpError } from '@/services/http';
import type { TrainingPlanSummaryVm } from '@/types/training';
import { TRAINING_WEEKDAYS } from '@/utils/training-constants';
import { REST_DAY_LABEL } from '@/utils/training-mapper';
import { CRUD_TOAST } from '@/utils/crud-toast-messages';

type UseTrainingPlanSidebarParams = {
  selectedWeekday: number;
  onSelectWeekday: (weekday: number) => void;
  notes: string | null;
  onNotesSaved: (notes: string | null) => void;
  planTitle: string;
  onPlanTitleSaved: (title: string) => void;
  onDayModeChanged: (weekday: number) => void;
};

export function useTrainingPlanSidebar({
  selectedWeekday,
  onSelectWeekday,
  notes,
  onNotesSaved,
  planTitle,
  onPlanTitleSaved,
  onDayModeChanged,
}: UseTrainingPlanSidebarParams) {
  const [planDays, setPlanDays] = useState<TrainingPlanSummaryVm[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notesDraft, setNotesDraft] = useState(notes ?? '');
  const [editPlanOpen, setEditPlanOpen] = useState(false);

  const loadPlan = useCallback(async () => {
    setLoading(true);
    try {
      const { days } = await getWorkoutPlanSummary();
      setPlanDays(days);
    } catch (error) {
      toastAuthError(
        error instanceof HttpError ? error.message : 'Could not load workout plan.',
      );
      setPlanDays([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPlan();
  }, [loadPlan]);

  useEffect(() => {
    setNotesDraft(notes ?? '');
  }, [notes, selectedWeekday]);

  const sidebarDays = useMemo(() => {
    return TRAINING_WEEKDAYS.map((day) => {
      const existing = planDays.find((entry) => entry.weekday === day.index);
      return {
        weekday: day.index,
        label: day.label,
        displayTitle: existing?.displayTitle ?? REST_DAY_LABEL,
        sheetTitle: existing?.sheetTitle ?? null,
        isActive: existing?.isActive ?? false,
      };
    });
  }, [planDays]);

  async function saveNotes() {
    setSaving(true);
    try {
      const nextNotes = notesDraft.trim() || null;
      await updateWorkoutDay(selectedWeekday, { notes: nextNotes });
      onNotesSaved(nextNotes);
      toastUpdated(CRUD_TOAST.workoutNotesUpdated);
    } catch (error) {
      toastAuthError(error instanceof HttpError ? error.message : 'Could not save notes.');
    } finally {
      setSaving(false);
    }
  }

  async function savePlanTitle(title: string) {
    const trimmed = title.trim();
    if (!trimmed || trimmed === REST_DAY_LABEL) return;

    setSaving(true);
    try {
      await updateWorkoutDay(selectedWeekday, { title: trimmed, isActive: true });
      onPlanTitleSaved(trimmed);
      setEditPlanOpen(false);
      await loadPlan();
      onDayModeChanged(selectedWeekday);
      toastUpdated(CRUD_TOAST.workoutPlanUpdated);
    } catch (error) {
      toastAuthError(error instanceof HttpError ? error.message : 'Could not update plan.');
    } finally {
      setSaving(false);
    }
  }

  async function selectRestDay(weekday: number) {
    const day = sidebarDays.find((entry) => entry.weekday === weekday);
    if (!day || !day.isActive) return;

    setSaving(true);
    try {
      await updateWorkoutDay(weekday, { isActive: false });
      await loadPlan();
      if (weekday === selectedWeekday) onDayModeChanged(weekday);
      toastUpdated(CRUD_TOAST.workoutPlanUpdated);
    } catch (error) {
      toastAuthError(error instanceof HttpError ? error.message : 'Could not update plan.');
    } finally {
      setSaving(false);
    }
  }

  async function selectSheet(weekday: number) {
    const day = sidebarDays.find((entry) => entry.weekday === weekday);
    if (!day?.sheetTitle || day.isActive) return;

    setSaving(true);
    try {
      await updateWorkoutDay(weekday, { isActive: true, title: day.sheetTitle });
      await loadPlan();
      if (weekday === selectedWeekday) onDayModeChanged(weekday);
      toastUpdated(CRUD_TOAST.workoutPlanUpdated);
    } catch (error) {
      toastAuthError(error instanceof HttpError ? error.message : 'Could not update plan.');
    } finally {
      setSaving(false);
    }
  }

  return {
    data: {
      sidebarDays,
      notesDraft,
      editPlanOpen,
      planTitle,
    },
    actions: {
      selectWeekday: onSelectWeekday,
      selectRestDay,
      selectSheet,
      setNotesDraft,
      saveNotes,
      savePlanTitle,
      reloadPlan: loadPlan,
      openEditPlan: () => setEditPlanOpen(true),
      closeEditPlan: () => setEditPlanOpen(false),
    },
    ui: {
      loading,
      saving,
      selectedWeekday,
    },
  };
}
