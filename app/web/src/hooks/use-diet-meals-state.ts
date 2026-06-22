'use client';

import { useState } from 'react';
import { useDietDayQuery } from '@/hooks/use-diet-day-query';
import { useDietIngredientDraft } from '@/hooks/use-diet-ingredient-draft';
import { useDietMealMutations } from '@/hooks/use-diet-meal-mutations';
import { toastAuthError, toastUpdated } from '@/lib/app-toast';
import { copyDietDay } from '@/services/diet';
import { HttpError } from '@/services/http';
import { CRUD_TOAST } from '@/utils/crud-toast-messages';
import { DIET_WEEKDAYS } from '@/utils/diet-constants';

export function useDietMealsState() {
  const dayQuery = useDietDayQuery();
  const [saving, setSaving] = useState(false);
  const [createMealOpen, setCreateMealOpen] = useState(false);
  const [copyDayOpen, setCopyDayOpen] = useState(false);

  async function copyDay(targetWeekday: number | 'all') {
    const sourceWeekday = dayQuery.data.selectedWeekday;
    if (targetWeekday === sourceWeekday) {
      setCopyDayOpen(false);
      return;
    }

    const targetWeekdays =
      targetWeekday === 'all'
        ? DIET_WEEKDAYS.filter((day) => day.index !== sourceWeekday).map((day) => day.index)
        : [targetWeekday];

    setSaving(true);
    try {
      const copiedDays = await Promise.all(
        targetWeekdays.map(async (weekday) => {
          const { meals } = await copyDietDay({ sourceWeekday, targetWeekday: weekday });
          return { weekday, meals };
        }),
      );
      for (const day of copiedDays) {
        dayQuery.actions.setMealsForDay(day.weekday, day.meals);
      }
      toastUpdated(CRUD_TOAST.dietDayCopied);
      setCopyDayOpen(false);
    } catch (error) {
      toastAuthError(error instanceof HttpError ? error.message : 'Could not copy diet day.');
    } finally {
      setSaving(false);
    }
  }

  const mealMutations = useDietMealMutations({
    meals: dayQuery.data.meals,
    setMeals: dayQuery.actions.setMeals,
    selectedWeekday: dayQuery.data.selectedWeekday,
    saving,
    setSaving,
    createMealOpen,
    setCreateMealOpen,
  });

  const ingredientDraft = useDietIngredientDraft({
    meals: dayQuery.data.meals,
    setMeals: dayQuery.actions.setMeals,
    setSaving,
  });

  return {
    data: {
      weekdayLabel: dayQuery.data.weekdayLabel,
      weekdayShortLabel: dayQuery.data.weekdayShortLabel,
      meals: dayQuery.data.meals,
      editItem: ingredientDraft.data.editItem,
      selectedWeekday: dayQuery.data.selectedWeekday,
    },
    actions: {
      prevDay: dayQuery.actions.prevDay,
      nextDay: dayQuery.actions.nextDay,
      openCopyDay: () => setCopyDayOpen(true),
      closeCopyDay: () => setCopyDayOpen(false),
      copyDay,
      ...mealMutations.actions,
      ...ingredientDraft.actions,
    },
    ui: {
      loading: dayQuery.ui.loading,
      saving,
      createMealOpen,
      copyDayOpen,
    },
  };
}
