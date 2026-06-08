export type FoodMacrosPer100g = {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

export type FoodSearchResult = {
  id: string;
  source: 'taco';
  externalFoodId: string;
  name: string;
  displayName: string;
  per100g: FoodMacrosPer100g;
  per100gLabel: string;
};

export type ScaledFoodMacros = FoodMacrosPer100g;
