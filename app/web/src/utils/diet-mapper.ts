import type { DietFoodItemVm, DietMealVm } from '@/types/diet';
import { formatIngredientDescription } from '@/utils/food-nutrition';

export type DietFoodItemRecord = {
  id: string;
  mealId: string;
  name: string;
  totalGrams?: string | number | null;
  externalSource?: string | null;
  externalFoodId?: string | null;
  caloriesPer100g?: number | null;
  proteinPer100g?: string | number | null;
  carbsPer100g?: string | number | null;
  fatsPer100g?: string | number | null;
  calories?: number | null;
  protein?: string | number | null;
  carbodrate?: string | number | null;
  fats?: string | number | null;
};

export type DietMealRecord = {
  id: string;
  userId: string;
  weekday?: number | null;
  name: string;
  mealTime?: string | null;
  isActive?: boolean;
  items?: DietFoodItemRecord[];
};

function toNumber(value: string | number | null | undefined) {
  if (value === null || value === undefined) return 0;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function mapFoodItemToVm(item: DietFoodItemRecord): DietFoodItemVm {
  const totalGrams = toNumber(item.totalGrams);
  return {
    id: item.id,
    mealId: item.mealId,
    status: 'saved',
    name: item.name,
    description: formatIngredientDescription(totalGrams, item.name),
    totalGrams,
    externalSource:
      item.externalSource === 'taco' || item.externalSource === 'manual'
        ? item.externalSource
        : null,
    externalFoodId: item.externalFoodId ?? null,
    per100g: {
      calories: item.caloriesPer100g ?? 0,
      protein: toNumber(item.proteinPer100g),
      carbs: toNumber(item.carbsPer100g),
      fats: toNumber(item.fatsPer100g),
    },
    calories: item.calories ?? 0,
    protein: toNumber(item.protein),
    carbs: toNumber(item.carbodrate),
    fats: toNumber(item.fats),
  };
}

export function mapMealToVm(meal: DietMealRecord): DietMealVm {
  return {
    id: meal.id,
    name: meal.name,
    weekday: meal.weekday ?? null,
    expanded: false,
    items: (meal.items ?? []).map(mapFoodItemToVm),
  };
}
