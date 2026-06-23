'use client';

import { useState, type Dispatch, SetStateAction } from 'react';
import { toastAuthError, toastUpdated } from '@/lib/app-toast';
import {
  createWorkoutExercise,
  deleteWorkoutExercise,
  reorderWorkoutExercises,
  updateWorkoutExercise,
} from '@/services/workout';
import { HttpError } from '@/services/http';
import type {
  TrainingDayPlanVm,
  TrainingExerciseDraftVm,
  TrainingExerciseVm,
} from '@/types/training';
import { collapseOtherGroups } from '@/utils/training-constants';
import { CRUD_TOAST } from '@/utils/crud-toast-messages';

function emptyDraft(groupId: string): TrainingExerciseDraftVm {
  return {
    id: '',
    draftKey: `draft-${Date.now()}`,
    groupId,
    status: 'draft',
    name: '',
    equipment: null,
    weightKg: null,
    series: null,
    repsMin: null,
    repsMax: null,
    imageUrl: null,
    isCompleted: false,
  };
}

type UseWorkoutExerciseDraftParams = {
  plan: TrainingDayPlanVm;
  setPlan: Dispatch<SetStateAction<TrainingDayPlanVm>>;
  setSaving: (value: boolean) => void;
};

export function useWorkoutExerciseDraft({ plan, setPlan, setSaving }: UseWorkoutExerciseDraftParams) {
  const [editExercise, setEditExercise] = useState<{
    groupId: string;
    exercise: TrainingExerciseVm;
  } | null>(null);

  function startExerciseDraft(groupId: string) {
    setPlan((prev) => ({
      ...prev,
      groups: collapseOtherGroups(prev.groups, groupId).map((group) =>
        group.id !== groupId ? group : { ...group, draft: emptyDraft(groupId) },
      ),
    }));
  }

  function changeDraftField(
    groupId: string,
    field: keyof TrainingExerciseDraftVm,
    value: string | number | null,
  ) {
    setPlan((prev) => ({
      ...prev,
      groups: prev.groups.map((group) => {
        if (group.id !== groupId || !group.draft) return group;
        return { ...group, draft: { ...group.draft, [field]: value } };
      }),
    }));
  }

  async function confirmDraft(groupId: string) {
    const group = plan.groups.find((entry) => entry.id === groupId);
    const draft = group?.draft;
    if (!draft?.name.trim()) return;

    setSaving(true);
    try {
      const { exercise } = await createWorkoutExercise(groupId, {
        name: draft.name.trim(),
        equipment: draft.equipment,
        weightKg: draft.weightKg,
        series: draft.series,
        repsMin: draft.repsMin,
        repsMax: draft.repsMax,
        imageUrl: draft.imageUrl,
      });

      setPlan((prev) => ({
        ...prev,
        groups: prev.groups.map((entry) =>
          entry.id === groupId
            ? {
                ...entry,
                draft: null,
                exercises: [...entry.exercises, { ...exercise, status: 'saved' }],
              }
            : entry,
        ),
      }));
      toastUpdated(CRUD_TOAST.exerciseCreated);
    } catch (error) {
      toastAuthError(error instanceof HttpError ? error.message : 'Could not save exercise.');
    } finally {
      setSaving(false);
    }
  }

  function cancelDraft(groupId: string) {
    setPlan((prev) => ({
      ...prev,
      groups: prev.groups.map((group) =>
        group.id === groupId ? { ...group, draft: null } : group,
      ),
    }));
  }

  function openEditExercise(groupId: string, exercise: TrainingExerciseVm) {
    setEditExercise({ groupId, exercise });
  }

  function openEditExerciseByIds(groupId: string, exerciseId: string) {
    const group = plan.groups.find((entry) => entry.id === groupId);
    const exercise = group?.exercises.find((entry) => entry.id === exerciseId);
    if (exercise) openEditExercise(groupId, exercise);
  }

  async function saveEditExercise(input: {
    name: string;
    equipment: string | null;
    weightKg: number | null;
    series: number | null;
    repsMin: number | null;
    repsMax: number | null;
  }) {
    if (!editExercise) return;
    setSaving(true);
    try {
      const { exercise } = await updateWorkoutExercise(
        editExercise.groupId,
        editExercise.exercise.id,
        input,
      );
      setPlan((prev) => ({
        ...prev,
        groups: prev.groups.map((group) =>
          group.id === editExercise.groupId
            ? {
                ...group,
                exercises: group.exercises.map((entry) =>
                  entry.id === exercise.id ? exercise : entry,
                ),
              }
            : group,
        ),
      }));
      setEditExercise(null);
      toastUpdated(CRUD_TOAST.exerciseUpdated);
    } catch (error) {
      toastAuthError(error instanceof HttpError ? error.message : 'Could not update exercise.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteEditExercise() {
    if (!editExercise) return;
    setSaving(true);
    try {
      await deleteWorkoutExercise(editExercise.groupId, editExercise.exercise.id);
      setPlan((prev) => ({
        ...prev,
        groups: prev.groups.map((group) =>
          group.id === editExercise.groupId
            ? {
                ...group,
                exercises: group.exercises.filter(
                  (entry) => entry.id !== editExercise.exercise.id,
                ),
              }
            : group,
        ),
      }));
      setEditExercise(null);
      toastUpdated(CRUD_TOAST.exerciseDeleted);
    } catch (error) {
      toastAuthError(error instanceof HttpError ? error.message : 'Could not delete exercise.');
    } finally {
      setSaving(false);
    }
  }

  async function reorderExercises(groupId: string, exerciseIds: string[]) {
    const group = plan.groups.find((entry) => entry.id === groupId);
    if (!group) return;

    const savedExercises = group.exercises.filter((entry) => entry.status === 'saved');
    const byId = new Map(savedExercises.map((entry) => [entry.id, entry]));
    const reordered = exerciseIds
      .map((id) => byId.get(id))
      .filter((entry): entry is TrainingExerciseVm => Boolean(entry));

    if (reordered.length !== savedExercises.length) return;

    const previousGroups = plan.groups;

    setPlan((prev) => ({
      ...prev,
      groups: prev.groups.map((entry) =>
        entry.id === groupId ? { ...entry, exercises: reordered } : entry,
      ),
    }));

    try {
      await reorderWorkoutExercises(groupId, exerciseIds);
    } catch (error) {
      setPlan((prev) => ({
        ...prev,
        groups: previousGroups,
      }));
      toastAuthError(error instanceof HttpError ? error.message : 'Could not reorder exercises.');
    }
  }

  async function toggleExerciseCompleted(groupId: string, exerciseId: string) {
    const group = plan.groups.find((entry) => entry.id === groupId);
    const exercise = group?.exercises.find((entry) => entry.id === exerciseId);
    if (!exercise) return;

    setSaving(true);
    try {
      const { exercise: updated } = await updateWorkoutExercise(groupId, exerciseId, {
        isCompleted: !exercise.isCompleted,
      });
      setPlan((prev) => ({
        ...prev,
        groups: prev.groups.map((entry) =>
          entry.id === groupId
            ? {
                ...entry,
                exercises: entry.exercises.map((item) =>
                  item.id === exerciseId ? updated : item,
                ),
              }
            : entry,
        ),
      }));
      toastUpdated(CRUD_TOAST.exerciseUpdated);
    } catch (error) {
      toastAuthError(error instanceof HttpError ? error.message : 'Could not update exercise.');
    } finally {
      setSaving(false);
    }
  }

  return {
    data: {
      editExercise,
    },
    actions: {
      startExerciseDraft,
      changeDraftField,
      confirmDraft,
      cancelDraft,
      openEditExercise,
      openEditExerciseByIds,
      saveEditExercise,
      deleteEditExercise,
      closeEditExercise: () => setEditExercise(null),
      toggleExerciseCompleted,
      reorderExercises,
    },
  };
}
