export const WATER_GLASS_VOLUME_L = 0.3;
export const WATER_MAX_TOTAL_L = 12;
export const WATER_GLASSES_PER_ROW = 6;
export const WATER_GLASS_ROW_COUNT = 2;
export const WATER_MAX_GLASS_SLOTS = WATER_GLASSES_PER_ROW * WATER_GLASS_ROW_COUNT;

export function weekdayToDateString(weekday: number) {
  const now = new Date();
  const diff = weekday - now.getDay();
  const date = new Date(now);
  date.setDate(now.getDate() + diff);
  return date.toISOString().slice(0, 10);
}

export function allWeekdayDateStrings() {
  return Array.from({ length: 7 }, (_, weekday) => weekdayToDateString(weekday));
}

export function clampWaterTotal(value: number) {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.min(WATER_MAX_TOTAL_L, Math.round(value * 10) / 10);
}

export function glassCountFromWaterTotal(waterTotal: number) {
  if (waterTotal <= 0) return 1;
  const needed = Math.max(1, Math.ceil(waterTotal / WATER_GLASS_VOLUME_L - 1e-9));
  return Math.min(WATER_MAX_GLASS_SLOTS, needed);
}

export function perGlassVolume(waterTotal: number, glassCount: number) {
  if (glassCount <= 0) return WATER_GLASS_VOLUME_L;
  return waterTotal / glassCount;
}

export function isWaterGoalComplete(waterTotal: number, waterIntake: number) {
  return waterIntake >= waterTotal - 1e-9;
}

export function computeWaterGlassState(waterTotal: number, waterIntake: number) {
  const glassCount = glassCountFromWaterTotal(waterTotal);
  const perGlass = perGlassVolume(waterTotal, glassCount);
  const isComplete = isWaterGoalComplete(waterTotal, waterIntake);
  const filledCount = isComplete
    ? glassCount
    : Math.min(glassCount, Math.floor(waterIntake / perGlass + 1e-9));

  return {
    perGlass,
    filledCount,
    glassCount,
    isComplete,
  };
}

/** Sempre 2 linhas de 6 copos (12 slots). */
export function buildGlassRows() {
  return [
    Array.from({ length: WATER_GLASSES_PER_ROW }, (_, index) => index),
    Array.from({ length: WATER_GLASSES_PER_ROW }, (_, offset) => WATER_GLASSES_PER_ROW + offset),
  ];
}

export function formatLiters(value: number) {
  return `${value.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}L`;
}

export function formatGlassVolumeLabel(perGlass = WATER_GLASS_VOLUME_L) {
  const ml = Math.round(perGlass * 1000);
  return `${ml}ml`;
}

export function computeWaterProgressPercent(waterIntake: number, waterTotal: number) {
  if (waterTotal <= 0) return 0;
  return Math.min(100, Math.round((waterIntake / waterTotal) * 100));
}

export function normalizeWaterTotalDraft(value: string) {
  const normalized = value.replace(',', '.').trim();
  if (!normalized) return '';
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) return '';
  if (parsed === 0) return '0';
  return String(clampWaterTotal(parsed));
}
