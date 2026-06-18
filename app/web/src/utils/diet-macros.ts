import type {
  DietFoodItemVm,
  DietMacroLegendVm,
  DietMacroSegmentVm,
  DietMacroSummaryVm,
  DietMacroTargets,
  DietMealVm,
} from '@/types/diet';
import type { TaskVm } from '@/types/task';
import { clampPercent } from '@/utils/number-draft';

export { clampPercent };

export function computeProgressPercent(consumed: number, target: number) {
  if (target <= 0) return 0;
  return clampPercent((consumed / target) * 100);
}

export function sumMacroTotals(items: DietFoodItemVm[]) {
  return items.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      carbs: acc.carbs + item.carbs,
      fats: acc.fats + item.fats,
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 },
  );
}

export function sumItemsFromMeals(meals: { items: DietFoodItemVm[]; draft?: DietFoodItemVm | null }[]) {
  const allItems = meals.flatMap((meal) => [
    ...meal.items,
    ...(meal.draft ? [meal.draft] : []),
  ]);
  return sumMacroTotals(allItems);
}

/** Macros from meals whose diet task is marked done for the day. */
export function sumConsumedFromCompletedMeals(meals: DietMealVm[], tasks: TaskVm[]) {
  const doneMealIds = new Set(
    tasks
      .filter((task) => task.sourceType === 'DIET_MEAL' && task.done && task.sourceId)
      .map((task) => task.sourceId as string),
  );

  if (doneMealIds.size === 0) {
    return { calories: 0, protein: 0, carbs: 0, fats: 0 };
  }

  return sumItemsFromMeals(meals.filter((meal) => doneMealIds.has(meal.id)));
}

export function formatKcal(value: number) {
  return `${value.toLocaleString('en-US')} Kcal`;
}

export function formatGrams(value: number) {
  return `${Math.round(value)}g`;
}

/** Gramas de macro com no máximo 1 casa decimal (evita 19.299999…). */
export function formatMacroGrams(value: number) {
  const rounded = Math.round(value * 10) / 10;
  if (Number.isInteger(rounded)) return `${rounded}g`;
  return `${rounded.toFixed(1)}g`;
}

export function formatMacroKcal(value: number) {
  return `${Math.round(value).toLocaleString('en-US')} Kcal`;
}

export const DIET_MACRO_COLOR = {
  protein: 'var(--color-red)',
  fats: '#B4801E',
  carbs: '#1E64B4',
} as const;

export function buildMacroSummaries(
  totals: { calories: number; protein: number; carbs: number },
  targets: Pick<DietMacroTargets, 'calories' | 'protein' | 'carbs'>,
): DietMacroSummaryVm[] {
  return [
    {
      key: 'calories',
      label: 'Calories',
      consumedLabel: formatKcal(totals.calories),
      targetLabel: formatKcal(targets.calories),
      percent: computeProgressPercent(totals.calories, targets.calories),
      barClassName: 'bg-red',
    },
    {
      key: 'protein',
      label: 'Protein',
      consumedLabel: formatGrams(totals.protein),
      targetLabel: formatGrams(targets.protein),
      percent: computeProgressPercent(totals.protein, targets.protein),
      barClassName: 'bg-red',
    },
    {
      key: 'carbs',
      label: 'Carbs',
      consumedLabel: formatGrams(totals.carbs),
      targetLabel: formatGrams(targets.carbs),
      percent: computeProgressPercent(totals.carbs, targets.carbs),
      barClassName: 'bg-[#1E64B4]',
    },
  ];
}

export function buildMacroSegments(totals: {
  protein: number;
  carbs: number;
  fats: number;
}): DietMacroSegmentVm[] {
  const sum = totals.protein + totals.carbs + totals.fats;
  if (sum <= 0) {
    return [];
  }

  return [
    {
      key: 'protein',
      label: 'Protein',
      color: DIET_MACRO_COLOR.protein,
      grams: totals.protein,
      percentOfTotal: (totals.protein / sum) * 100,
    },
    {
      key: 'carbs',
      label: 'Carbs',
      color: DIET_MACRO_COLOR.carbs,
      grams: totals.carbs,
      percentOfTotal: (totals.carbs / sum) * 100,
    },
    {
      key: 'fats',
      label: 'Fats',
      color: DIET_MACRO_COLOR.fats,
      grams: totals.fats,
      percentOfTotal: (totals.fats / sum) * 100,
    },
  ];
}

export function buildMacroLegend(
  totals: { protein: number; carbs: number; fats: number },
  targets: Pick<DietMacroTargets, 'protein' | 'carbs' | 'fats'>,
): DietMacroLegendVm[] {
  return [
    {
      key: 'protein',
      label: 'Protein',
      color: DIET_MACRO_COLOR.protein,
      currentGrams: totals.protein,
      targetGrams: targets.protein,
      overTarget: totals.protein > targets.protein,
    },
    {
      key: 'carbs',
      label: 'Carbs',
      color: DIET_MACRO_COLOR.carbs,
      currentGrams: totals.carbs,
      targetGrams: targets.carbs,
      overTarget: totals.carbs > targets.carbs,
    },
    {
      key: 'fats',
      label: 'Fats',
      color: DIET_MACRO_COLOR.fats,
      currentGrams: totals.fats,
      targetGrams: targets.fats,
      overTarget: totals.fats > targets.fats,
    },
  ];
}
