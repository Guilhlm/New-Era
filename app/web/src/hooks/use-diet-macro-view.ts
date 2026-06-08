'use client';

import { useMemo } from 'react';
import type { DietMealVm } from '@/types/diet';
import {
  buildMacroLegend,
  buildMacroSegments,
  buildMacroSummaries,
  formatMacroKcal,
  sumItemsFromMeals,
} from '@/utils/diet-macros';

const EMPTY_MACRO_TOTALS = { calories: 0, protein: 0, carbs: 0, fats: 0 };

const STATIC_MACRO_SEGMENTS = buildMacroSegments(EMPTY_MACRO_TOTALS);

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

export function useDietMacroView(meals: DietMealVm[]) {
  const planTotals = useMemo(() => sumItemsFromMeals(meals), [meals]);
  const targets = useMemo(() => buildTargetsFromMeals(planTotals), [planTotals]);

  const macroSummaries = useMemo(
    () => buildMacroSummaries(EMPTY_MACRO_TOTALS, targets),
    [targets],
  );
  const dailyMacroLegend = useMemo(
    () => buildMacroLegend(EMPTY_MACRO_TOTALS, planTotals),
    [planTotals],
  );

  return {
    macroSummaries,
    dailyMacros: {
      totalKcalLabel: formatMacroKcal(0),
      segments: STATIC_MACRO_SEGMENTS,
      legend: dailyMacroLegend,
    },
  };
}
