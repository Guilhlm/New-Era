import type { FoodMacrosPer100g } from '@/types/foods';

export type DietIngredientSource = 'taco' | 'manual';

export type DietFoodItemVm = {
  id: string;
  mealId?: string;
  status: 'draft' | 'saved';
  name: string;
  description: string;
  totalGrams: number;
  externalSource?: DietIngredientSource | null;
  externalFoodId?: string | null;
  per100g: FoodMacrosPer100g;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

export type DietIngredientDraftVm = DietFoodItemVm & {
  status: 'draft';
  draftKey: string;
};

export type DietMealVm = {
  id: string;
  name: string;
  weekday?: number | null;
  items: DietFoodItemVm[];
  expanded?: boolean;
  draft?: DietIngredientDraftVm | null;
};

export type DietMacroSummaryVm = {
  key: 'calories' | 'protein' | 'carbs';
  label: string;
  consumedLabel: string;
  targetLabel: string;
  percent: number;
  barClassName: string;
};

export type DietMacroSegmentVm = {
  key: 'protein' | 'carbs' | 'fats';
  label: string;
  color: string;
  grams: number;
  percentOfTotal: number;
};

export type DietMacroLegendVm = {
  key: 'protein' | 'carbs' | 'fats';
  label: string;
  color: string;
  currentGrams: number;
  targetGrams: number;
  overTarget: boolean;
};

export type DietWeeklyBarVm = {
  label: string;
  heightPercent: number;
};

export type DietMacroTargets = {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

export type CreateDietMealInput = {
  name: string;
  weekday: number;
};

export type CreateDietFoodItemInput = {
  name: string;
  totalGrams: number;
  externalSource: DietIngredientSource;
  externalFoodId: string | null;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatsPer100g: number;
};

export type UpdateDietFoodItemInput = {
  totalGrams: number;
};

export type CopyDietDayInput = {
  sourceWeekday: number;
  targetWeekday: number;
};
