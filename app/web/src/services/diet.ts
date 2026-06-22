import type { FoodSearchResult } from '@/types/foods';
import { getJson, postJson, patchJson, deleteJson } from '@/services/http';
import type { DietMealVm } from '@/types/diet';
import type {
  CopyDietDayInput,
  CreateDietFoodItemInput,
  CreateDietMealInput,
  UpdateDietFoodItemInput,
} from '@/types/diet';

export function searchFoods(query: string, limit = 10) {
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  return getJson<{ results: FoodSearchResult[] }>(`/api/foods/search?${params.toString()}`, {
    cache: 'no-store',
    credentials: 'include',
  });
}

export function getDietDay(weekday: number) {
  return getJson<{ meals: DietMealVm[] }>(`/api/diet/day?weekday=${weekday}`, {
    cache: 'no-store',
    credentials: 'include',
  });
}

export function createDietMeal(input: CreateDietMealInput) {
  return postJson<{ meal: DietMealVm }, CreateDietMealInput>('/api/diet/meals', input, {
    cache: 'no-store',
    credentials: 'include',
  });
}

export function updateDietMeal(mealId: string, input: { name: string }) {
  return patchJson<{ meal: DietMealVm }, { name: string }>(`/api/diet/meals/${mealId}`, input, {
    cache: 'no-store',
    credentials: 'include',
  });
}

export function deleteDietMeal(mealId: string) {
  return deleteJson<{ ok: true }>(`/api/diet/meals/${mealId}`, {
    cache: 'no-store',
    credentials: 'include',
  });
}

export function duplicateDietMeal(mealId: string) {
  return postJson<{ meal: DietMealVm }, Record<string, never>>(
    `/api/diet/meals/${mealId}/duplicate`,
    {},
    { cache: 'no-store', credentials: 'include' },
  );
}

export function copyDietDay(input: CopyDietDayInput) {
  return postJson<{ meals: DietMealVm[] }, CopyDietDayInput>('/api/diet/day/copy', input, {
    cache: 'no-store',
    credentials: 'include',
  });
}

export function createDietFoodItem(mealId: string, input: CreateDietFoodItemInput) {
  return postJson<{ item: DietMealVm['items'][number] }, CreateDietFoodItemInput>(
    `/api/diet/meals/${mealId}/items`,
    input,
    { cache: 'no-store', credentials: 'include' },
  );
}

export function updateDietFoodItem(mealId: string, itemId: string, input: UpdateDietFoodItemInput) {
  return patchJson<{ item: DietMealVm['items'][number] }, UpdateDietFoodItemInput>(
    `/api/diet/meals/${mealId}/items/${itemId}`,
    input,
    { cache: 'no-store', credentials: 'include',
    },
  );
}

export function deleteDietFoodItem(mealId: string, itemId: string) {
  return deleteJson<{ ok: true }>(`/api/diet/meals/${mealId}/items/${itemId}`, {
    cache: 'no-store',
    credentials: 'include',
  });
}
