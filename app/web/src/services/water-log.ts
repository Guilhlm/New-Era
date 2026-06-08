import { getJson, patchJson } from '@/services/http';

export type WaterLogVm = {
  id: string | null;
  date: string;
  waterTotal: number;
  waterIntake: number;
  glassCount: number;
};

export type UpsertWaterLogInput = {
  date: string;
  waterTotal?: number;
  waterIntake?: number;
};

export function getWaterLogDay(date: string) {
  return getJson<WaterLogVm>(`/api/water-log/day?date=${encodeURIComponent(date)}`, {
    cache: 'no-store',
    credentials: 'include',
  });
}

export function upsertWaterLogDay(input: UpsertWaterLogInput) {
  return patchJson<WaterLogVm, UpsertWaterLogInput>('/api/water-log/day', input, {
    cache: 'no-store',
    credentials: 'include',
  });
}
