'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { toastAuthError, toastUpdated } from '@/lib/app-toast';
import { queryKeys } from '@/lib/query-keys';
import { HttpError } from '@/services/http';
import {
  type FitnessMacroGoal,
  type UpdateFitnessMacroGoalInput,
  getCurrentFitnessMacroGoal,
  updateCurrentFitnessMacroGoal,
} from '@/services/fitness-macro-goal';
import {
  formatCaloriesLabel,
  formatWeightGoalLabel,
  normalizeCaloriesDraft,
  normalizeWeightGoalDraft,
  parseNumeric,
  toDraftString,
} from '@/utils/fitness-macro-goal';
import { CRUD_TOAST } from '@/utils/crud-toast-messages';

export type GoalRowVm = {
  key: 'weight' | 'calories';
  label: string;
  valueLabel: string;
  draft: string;
};

type GoalDrafts = {
  weightGoal: string;
  calories: string;
};

function draftsFromGoal(goal: FitnessMacroGoal | null): GoalDrafts {
  return {
    weightGoal: normalizeWeightGoalDraft(toDraftString(goal?.weightGoal)),
    calories: normalizeCaloriesDraft(toDraftString(goal?.calories)),
  };
}

function buildRows(saved: GoalDrafts, editing: boolean, drafts: GoalDrafts): GoalRowVm[] {
  const weightDraft = editing ? drafts.weightGoal : saved.weightGoal;
  const caloriesDraft = editing ? drafts.calories : saved.calories;

  return [
    {
      key: 'weight',
      label: 'Weight goal',
      valueLabel: formatWeightGoalLabel(saved.weightGoal),
      draft: weightDraft,
    },
    {
      key: 'calories',
      label: 'Daily calories',
      valueLabel: formatCaloriesLabel(saved.calories),
      draft: caloriesDraft,
    },
  ];
}

export function useFitnessMacroGoal() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState<GoalDrafts>({ weightGoal: '', calories: '' });
  const [drafts, setDrafts] = useState<GoalDrafts>({ weightGoal: '', calories: '' });

  const query = useQuery({
    queryKey: queryKeys.fitnessMacroGoal,
    queryFn: getCurrentFitnessMacroGoal,
    retry: 3,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (query.isPending) return;
    const next = draftsFromGoal(query.data?.goal ?? null);
    setSaved(next);
    if (!editing) setDrafts(next);
  }, [query.data, query.isPending, editing]);

  const saveMutation = useMutation({
    mutationFn: (payload: UpdateFitnessMacroGoalInput) => updateCurrentFitnessMacroGoal(payload),
    onSuccess: ({ goal }) => {
      queryClient.setQueryData(queryKeys.fitnessMacroGoal, { goal });
      const next = draftsFromGoal(goal);
      setSaved(next);
      setDrafts(next);
      setEditing(false);
      toastUpdated(CRUD_TOAST.goalsUpdated);
    },
    onError: (error) => {
      const message =
        error instanceof HttpError && error.message ? error.message : 'Could not save goals.';
      toastAuthError(message);
    },
  });

  const dirty = useMemo(
    () => ({
      weightGoal:
        normalizeWeightGoalDraft(drafts.weightGoal) !== normalizeWeightGoalDraft(saved.weightGoal),
      calories: normalizeCaloriesDraft(drafts.calories) !== normalizeCaloriesDraft(saved.calories),
    }),
    [drafts.calories, drafts.weightGoal, saved.calories, saved.weightGoal],
  );

  const rows = useMemo(
    () => buildRows(saved, editing, drafts),
    [drafts, editing, saved],
  );

  async function save() {
    const payload: UpdateFitnessMacroGoalInput = {};

    if (dirty.weightGoal) {
      const trimmed = drafts.weightGoal.trim();
      payload.weightGoal = trimmed ? parseNumeric(trimmed) : null;
    }

    if (dirty.calories) {
      const trimmed = drafts.calories.trim();
      payload.calories = trimmed ? Number(normalizeCaloriesDraft(trimmed)) : null;
    }

    if (Object.keys(payload).length === 0) return;
    await saveMutation.mutateAsync(payload);
  }

  async function toggleEdit() {
    if (!editing) {
      setEditing(true);
      return;
    }

    if (!dirty.weightGoal && !dirty.calories) {
      setEditing(false);
      setDrafts(saved);
      return;
    }

    await save();
  }

  return {
    data: {
      rows,
      editing,
      loading: query.isPending,
      saving: saveMutation.isPending,
      dirty,
    },
    actions: {
      toggleEdit,
      setWeightGoalDraft: (value: string) =>
        setDrafts((d) => ({ ...d, weightGoal: normalizeWeightGoalDraft(value) })),
      setCaloriesDraft: (value: string) =>
        setDrafts((d) => ({ ...d, calories: normalizeCaloriesDraft(value) })),
    },
  };
}
