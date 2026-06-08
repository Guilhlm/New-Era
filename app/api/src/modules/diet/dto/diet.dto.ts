export type CreateDietMealDto = {
  userId: string;
  name: string;
  weekday: number;
  mealTime?: string | null;
};

export type UpdateDietMealDto = {
  name?: string;
  mealTime?: string | null;
  isActive?: boolean;
};

export type CreateDietFoodItemDto = {
  name: string;
  totalGrams: number;
  externalSource: 'taco';
  externalFoodId: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatsPer100g: number;
};

export type UpdateDietFoodItemDto = {
  totalGrams: number;
};
