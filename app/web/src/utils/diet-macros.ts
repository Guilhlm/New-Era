import type {
  DietFoodItemVm,
  DietMacroLegendVm,
  DietMacroSegmentVm,
  DietMacroSummaryVm,
  DietMacroTargets,
} from '@/types/diet';
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

export function formatKcal(value: number) {
  return `${value.toLocaleString('pt-BR')} Kcal`;
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
  return `${Math.round(value).toLocaleString('pt-BR')} Kcal`;
}

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
      barClassName: 'bg-teal-400',
    },
    {
      key: 'carbs',
      label: 'Carbs',
      consumedLabel: formatGrams(totals.carbs),
      targetLabel: formatGrams(targets.carbs),
      percent: computeProgressPercent(totals.carbs, targets.carbs),
      barClassName: 'bg-yellow-400',
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
    return [
      { key: 'protein', label: 'Protein', color: '#2dd4bf', grams: 0, percentOfTotal: 34 },
      { key: 'carbs', label: 'Carbohydrate', color: '#facc15', grams: 0, percentOfTotal: 33 },
      { key: 'fats', label: 'Fats', color: '#60a5fa', grams: 0, percentOfTotal: 33 },
    ];
  }

  return [
    {
      key: 'protein',
      label: 'Protein',
      color: '#2dd4bf',
      grams: totals.protein,
      percentOfTotal: (totals.protein / sum) * 100,
    },
    {
      key: 'carbs',
      label: 'Carbohydrate',
      color: '#facc15',
      grams: totals.carbs,
      percentOfTotal: (totals.carbs / sum) * 100,
    },
    {
      key: 'fats',
      label: 'Fats',
      color: '#60a5fa',
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
      colorClassName: 'bg-teal-400',
      currentGrams: totals.protein,
      targetGrams: targets.protein,
      overTarget: totals.protein > targets.protein,
    },
    {
      key: 'carbs',
      label: 'Carbohydrate',
      colorClassName: 'bg-yellow-400',
      currentGrams: totals.carbs,
      targetGrams: targets.carbs,
      overTarget: totals.carbs > targets.carbs,
    },
    {
      key: 'fats',
      label: 'Fats',
      colorClassName: 'bg-blue-400',
      currentGrams: totals.fats,
      targetGrams: targets.fats,
      overTarget: totals.fats > targets.fats,
    },
  ];
}
