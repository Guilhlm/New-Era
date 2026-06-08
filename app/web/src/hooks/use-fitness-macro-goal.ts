'use client';

import { useEffect, useMemo, useState } from 'react';
import { toastAuthError, toastUpdated } from '@/lib/app-toast';
import { HttpError } from '@/services/http';
import {
  type FitnessMacroGoal,
  type UpdateFitnessMacroGoalInput,
  getCurrentFitnessMacroGoal,
  updateCurrentFitnessMacroGoal,
} from '@/services/fitness-macro-goal';
import {
  computeWeightProgressPercent,
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
  showProgress: boolean;
};

type UseFitnessMacroGoalParams = {
  currentWeightKg: number | null;
};

type GoalDrafts = {
  weightGoal: string;
  calories: string;
};

function draftsFromGoal(goal: FitnessMacroGoal): GoalDrafts {
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
      showProgress: true,
    },
    {
      key: 'calories',
      label: 'Daily calories',
      valueLabel: formatCaloriesLabel(saved.calories),
      draft: caloriesDraft,
      showProgress: false,
    },
  ];
}

export function useFitnessMacroGoal({ currentWeightKg }: UseFitnessMacroGoalParams) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState<GoalDrafts>({ weightGoal: '', calories: '' });
  const [drafts, setDrafts] = useState<GoalDrafts>({ weightGoal: '', calories: '' });

  useEffect(() => {
    let alive = true;
    const run = async () => {
      try {
        const { goal } = await getCurrentFitnessMacroGoal();
        if (!alive) return;
        const next = draftsFromGoal(goal);
        setSaved(next);
        setDrafts(next);
      } catch {
        if (!alive) return;
      } finally {
        if (alive) setLoading(false);
      }
    };

    const id = window.setTimeout(() => {
      void run();
    }, 0);

    return () => {
      alive = false;
      window.clearTimeout(id);
    };
  }, []);

  const dirty = useMemo(
    () => ({
      weightGoal:
        normalizeWeightGoalDraft(drafts.weightGoal) !== normalizeWeightGoalDraft(saved.weightGoal),
      calories: normalizeCaloriesDraft(drafts.calories) !== normalizeCaloriesDraft(saved.calories),
    }),
    [drafts.calories, drafts.weightGoal, saved.calories, saved.weightGoal],
  );

  const weightProgress = useMemo(() => {
    const goalKg = parseNumeric(saved.weightGoal);
    return computeWeightProgressPercent(currentWeightKg, goalKg);
  }, [currentWeightKg, saved.weightGoal]);

  const rows = useMemo(
    () => buildRows(saved, editing, drafts),
    [drafts, editing, saved],
  );

  async function save() {
    const payload: UpdateFitnessMacroGoalInput = {
      weightGoal: drafts.weightGoal.trim() ? normalizeWeightGoalDraft(drafts.weightGoal) : null,
      calories: drafts.calories.trim() ? Number(normalizeCaloriesDraft(drafts.calories)) : null,
    };

    setSaving(true);
    try {
      const { goal } = await updateCurrentFitnessMacroGoal(payload);
      const next = draftsFromGoal(goal);
      setSaved(next);
      setDrafts(next);
      setEditing(false);
      toastUpdated(CRUD_TOAST.goalsUpdated);
    } catch (error) {
      const message =
        error instanceof HttpError && error.message ? error.message : 'Could not save goals.';
      toastAuthError(message);
    } finally {
      setSaving(false);
    }
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
      weightProgress,
      editing,
      loading,
      saving,
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
