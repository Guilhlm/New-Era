import { clampPercent, normalizeWeightDraft, toDraftString } from '@/utils/number-draft';

export { normalizeWeightDraft as normalizeWeightGoalDraft, toDraftString };

export function normalizeCaloriesDraft(value: string) {
  return value.replace(/\D/g, '').slice(0, 5);
}

export function parseNumeric(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = typeof value === 'number' ? value : parseFloat(String(value).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

export function computeWeightProgressPercent(currentWeightKg: number | null, weightGoalKg: number | null) {
  if (currentWeightKg === null || weightGoalKg === null || weightGoalKg <= 0) return 0;
  return clampPercent(Math.round((currentWeightKg / weightGoalKg) * 100));
}

export function formatWeightGoalLabel(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '-- Kg';
  return `${trimmed} Kg`;
}

export function formatCaloriesLabel(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '-- kcal';
  return `${trimmed} kcal`;
}
