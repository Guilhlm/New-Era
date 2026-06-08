'use client';

import { useState } from 'react';
import { useDietDayQuery } from '@/hooks/use-diet-day-query';
import { useDietIngredientDraft } from '@/hooks/use-diet-ingredient-draft';
import { useDietMealMutations } from '@/hooks/use-diet-meal-mutations';

export function useDietMealsState() {
  const dayQuery = useDietDayQuery();
  const [saving, setSaving] = useState(false);
  const [createMealOpen, setCreateMealOpen] = useState(false);

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
      ...mealMutations.actions,
      ...ingredientDraft.actions,
    },
    ui: {
      loading: dayQuery.ui.loading,
      saving,
      createMealOpen,
    },
  };
}
