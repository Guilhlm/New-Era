import { getJson, patchJson } from '@/services/http';

export type FitnessMacroGoal = {
  id: string;
  userId?: string;
  weightGoal?: string | number | null;
  calories?: number | null;
  protein?: string | number | null;
  fats?: string | number | null;
  carbodrate?: string | number | null;
  updatedAt?: string;
} | null;

export type UpdateFitnessMacroGoalInput = Partial<{
  weightGoal: number | string | null;
  calories: number | null;
}>;

export function getCurrentFitnessMacroGoal() {
  return getJson<{ goal: FitnessMacroGoal }>('/api/fitness-macro-goal/current', {
    cache: 'no-store',
    credentials: 'include',
  });
}

export function updateCurrentFitnessMacroGoal(input: UpdateFitnessMacroGoalInput) {
  return patchJson<{ goal: FitnessMacroGoal }, UpdateFitnessMacroGoalInput>(
    '/api/fitness-macro-goal/current',
    input,
    { cache: 'no-store', credentials: 'include' },
  );
}
