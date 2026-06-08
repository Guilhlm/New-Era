import type {
  FoodMacrosPer100g,
  FoodSearchResult,
  ScaledFoodMacros,
} from '@/types/foods';

export type { FoodMacrosPer100g, FoodSearchResult, ScaledFoodMacros };

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

export function scaleMacrosFrom100g(per100g: FoodMacrosPer100g, grams: number): ScaledFoodMacros {
  const factor = grams / 100;
  return {
    calories: Math.round(per100g.calories * factor),
    protein: round1(per100g.protein * factor),
    carbs: round1(per100g.carbs * factor),
    fats: round1(per100g.fats * factor),
  };
}

export function formatPer100gLabel(per100g: FoodMacrosPer100g) {
  return `100g · ${per100g.calories} Kcal · ${per100g.protein}g P · ${per100g.carbs}g C · ${per100g.fats}g F`;
}

export function formatIngredientDescription(grams: number, name: string) {
  return `${Math.round(grams)}g - ${name}`;
}

export function buildIngredientDraft(
  mealId: string,
  food: FoodSearchResult,
  grams = 100,
  draftKey?: string,
) {
  const scaled = scaleMacrosFrom100g(food.per100g, grams);
  const name = food.displayName;
  return {
    id: '',
    draftKey: draftKey ?? `draft-${Date.now()}`,
    mealId,
    status: 'draft' as const,
    name,
    description: formatIngredientDescription(grams, name),
    totalGrams: grams,
    externalSource: food.source,
    externalFoodId: food.externalFoodId,
    per100g: food.per100g,
    calories: scaled.calories,
    protein: scaled.protein,
    carbs: scaled.carbs,
    fats: scaled.fats,
  };
}

export function updateDraftGrams<T extends { name: string; per100g: FoodMacrosPer100g; totalGrams: number }>(
  draft: T,
  grams: number,
) {
  const scaled = scaleMacrosFrom100g(draft.per100g, grams);
  return {
    ...draft,
    totalGrams: grams,
    description: formatIngredientDescription(grams, draft.name),
    calories: scaled.calories,
    protein: scaled.protein,
    carbs: scaled.carbs,
    fats: scaled.fats,
  };
}
