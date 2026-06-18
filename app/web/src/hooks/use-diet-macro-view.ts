'use client';

import { useMemo } from 'react';
import type { DietMealVm } from '@/types/diet';
import type { TaskVm } from '@/types/task';
import {
  buildMacroLegend,
  buildMacroSegments,
  buildMacroSummaries,
  formatMacroKcal,
  sumConsumedFromCompletedMeals,
  sumItemsFromMeals,
} from '@/utils/diet-macros';

function buildTargetsFromMeals(planTotals: {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}) {
  return {
    calories: planTotals.calories,
    protein: planTotals.protein,
    carbs: planTotals.carbs,
    fats: planTotals.fats,
  };
}

export function useDietMacroView(meals: DietMealVm[], tasks: TaskVm[]) {
  const planTotals = useMemo(() => sumItemsFromMeals(meals), [meals]);
  const consumedTotals = useMemo(
    () => sumConsumedFromCompletedMeals(meals, tasks),
    [meals, tasks],
  );
  const targets = useMemo(() => buildTargetsFromMeals(planTotals), [planTotals]);

  const macroSummaries = useMemo(
    () => buildMacroSummaries(consumedTotals, targets),
    [consumedTotals, targets],
  );
  const dailyMacroLegend = useMemo(
    () => buildMacroLegend(consumedTotals, planTotals),
    [consumedTotals, planTotals],
  );
  const dailyMacroSegments = useMemo(() => buildMacroSegments(consumedTotals), [consumedTotals]);

  return {
    macroSummaries,
    dailyMacros: {
      totalKcalLabel: formatMacroKcal(planTotals.calories),
      segments: dailyMacroSegments,
      legend: dailyMacroLegend,
    },
  };
}
