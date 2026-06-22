'use client';

import type { Dispatch, SetStateAction } from 'react';
import { toastAuthError, toastUpdated } from '@/lib/app-toast';
import {
  createDietMeal,
  deleteDietMeal,
  duplicateDietMeal,
  updateDietMeal,
} from '@/services/diet';
import { HttpError } from '@/services/http';
import type { DietMealVm } from '@/types/diet';
import { collapseOtherMeals } from '@/utils/diet-constants';
import { CRUD_TOAST } from '@/utils/crud-toast-messages';

type UseDietMealMutationsParams = {
  meals: DietMealVm[];
  setMeals: Dispatch<SetStateAction<DietMealVm[]>>;
  selectedWeekday: number;
  saving: boolean;
  setSaving: (value: boolean) => void;
  createMealOpen: boolean;
  setCreateMealOpen: (value: boolean) => void;
};

export function useDietMealMutations({
  meals,
  setMeals,
  selectedWeekday,
  saving,
  setSaving,
  createMealOpen,
  setCreateMealOpen,
}: UseDietMealMutationsParams) {
  function openCreateMeal() {
    setCreateMealOpen(true);
  }

  function closeCreateMeal() {
    setCreateMealOpen(false);
  }

  async function createMeal(name: string) {
    setSaving(true);
    try {
      const { meal } = await createDietMeal({ name, weekday: selectedWeekday });
      setMeals((prev) => [...prev, { ...meal, expanded: false, draft: null }]);
      setCreateMealOpen(false);
      toastUpdated(CRUD_TOAST.mealCreated);
    } catch (error) {
      toastAuthError(error instanceof HttpError ? error.message : 'Could not create meal.');
    } finally {
      setSaving(false);
    }
  }

  async function renameMeal(mealId: string, name: string) {
    setSaving(true);
    try {
      const { meal } = await updateDietMeal(mealId, { name });
      setMeals((prev) =>
        prev.map((entry) => (entry.id === mealId ? { ...entry, name: meal.name } : entry)),
      );
      toastUpdated(CRUD_TOAST.mealUpdated);
    } catch (error) {
      toastAuthError(error instanceof HttpError ? error.message : 'Could not rename meal.');
    } finally {
      setSaving(false);
    }
  }

  async function removeMeal(mealId: string) {
    setSaving(true);
    try {
      await deleteDietMeal(mealId);
      setMeals((prev) => prev.filter((entry) => entry.id !== mealId));
      toastUpdated(CRUD_TOAST.mealDeleted);
    } catch (error) {
      toastAuthError(error instanceof HttpError ? error.message : 'Could not delete meal.');
    } finally {
      setSaving(false);
    }
  }

  async function duplicateMeal(mealId: string) {
    setSaving(true);
    try {
      const { meal } = await duplicateDietMeal(mealId);
      setMeals((prev) => [...prev, { ...meal, expanded: false, draft: null }]);
      toastUpdated(CRUD_TOAST.mealDuplicated);
    } catch (error) {
      toastAuthError(error instanceof HttpError ? error.message : 'Could not duplicate meal.');
    } finally {
      setSaving(false);
    }
  }

  function toggleMealExpanded(mealId: string) {
    setMeals((prev) => {
      const target = prev.find((meal) => meal.id === mealId);
      if (!target) return prev;

      if (target.expanded) {
        return prev.map((meal) => (meal.id === mealId ? { ...meal, expanded: false } : meal));
      }

      return collapseOtherMeals(prev, mealId);
    });
  }

  return {
    actions: {
      openCreateMeal,
      closeCreateMeal,
      createMeal,
      renameMeal,
      removeMeal,
      duplicateMeal,
      toggleMealExpanded,
    },
    ui: {
      saving,
      createMealOpen,
    },
    meals,
  };
}
