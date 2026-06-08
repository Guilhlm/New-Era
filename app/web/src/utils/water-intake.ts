export const WATER_GLASS_VOLUME_L = 0.3;

export function weekdayToDateString(weekday: number) {
  const now = new Date();
  const diff = weekday - now.getDay();
  const date = new Date(now);
  date.setDate(now.getDate() + diff);
  return date.toISOString().slice(0, 10);
}

export function glassCountFromWaterTotal(waterTotal: number) {
  if (waterTotal <= 0) return 1;
  return Math.max(1, Math.ceil(waterTotal / WATER_GLASS_VOLUME_L - 1e-9));
}

export function computeWaterGlassState(waterTotal: number, waterIntake: number) {
  const glassCount = glassCountFromWaterTotal(waterTotal);
  const filledCount = Math.min(
    glassCount,
    Math.floor(waterIntake / WATER_GLASS_VOLUME_L + 1e-9),
  );

  return {
    perGlass: WATER_GLASS_VOLUME_L,
    filledCount,
    glassCount,
  };
}

export function formatLiters(value: number) {
  return `${value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}L`;
}

export function normalizeWaterTotalDraft(value: string) {
  const normalized = value.replace(',', '.').trim();
  if (!normalized) return '';
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) return '';
  return String(Math.round(parsed * 10) / 10);
}
