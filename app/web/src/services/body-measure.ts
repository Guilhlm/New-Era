import { getJson, patchJson } from '@/services/http';

export type LatestBodyMeasure = {
  id: string;
  userId?: string;
  recordedAt?: string;
  updatedAt?: string;
  weight?: string | number | null;
  height?: string | number | null;
  calfRight?: string | number | null;
  calfLeft?: string | number | null;
  quadRight?: string | number | null;
  quadLeft?: string | number | null;
  waist?: string | number | null;
  abdomen?: string | number | null;
  back?: string | number | null;
  chest?: string | number | null;
  shoulderCircumference?: string | number | null;
  neckCircumference?: string | number | null;
  bicepsRight?: string | number | null;
  bicepsLeft?: string | number | null;
  forearmRight?: string | number | null;
  forearmLeft?: string | number | null;
} | null;

export type LatestBodyVital = {
  id: string;
  userId?: string;
  recordedAt?: string;
  updatedAt?: string;
  bodyFat?: string | number | null;
  bodyWater?: string | number | null;
  leanMass?: string | number | null;
  boneMass?: string | number | null;
  restingHeartRate?: number | null;
  maxHeartRate?: number | null;
  basalMetabolicRate?: number | null;
  hydrationLevel?: string | number | null;
  sleepHours?: string | number | null;
} | null;

/** Campos numéricos que o PATCH da última medida aceita */
export type UpdateLatestBodyMeasureInput = Partial<{
  weight: number | string | null;
  height: number | string | null;
  calfRight: number | string | null;
  calfLeft: number | string | null;
  quadRight: number | string | null;
  quadLeft: number | string | null;
  waist: number | string | null;
  abdomen: number | string | null;
  back: number | string | null;
  chest: number | string | null;
  shoulderCircumference: number | string | null;
  neckCircumference: number | string | null;
  bicepsRight: number | string | null;
  bicepsLeft: number | string | null;
  forearmRight: number | string | null;
  forearmLeft: number | string | null;
}>;

export type UpdateLatestBodyVitalInput = Partial<{
  bodyFat: number | string | null;
  bodyWater: number | string | null;
  leanMass: number | string | null;
  boneMass: number | string | null;
  restingHeartRate: number | null;
  maxHeartRate: number | null;
  basalMetabolicRate: number | null;
  hydrationLevel: number | string | null;
  sleepHours: number | string | null;
}>;

export function getLatestBodyMeasure() {
  return getJson<{ measure: LatestBodyMeasure }>('/api/body-measure/latest', {
    cache: 'no-store',
    credentials: 'include',
  });
}

export function updateLatestBodyMeasure(input: UpdateLatestBodyMeasureInput) {
  return patchJson<{ measure: LatestBodyMeasure }, UpdateLatestBodyMeasureInput>(
    '/api/body-measure/latest',
    input,
    { cache: 'no-store', credentials: 'include' },
  );
}

export function getBodyMeasureHistory() {
  return getJson<{ measures: NonNullable<LatestBodyMeasure>[] }>('/api/body-measure/history', {
    cache: 'no-store',
    credentials: 'include',
  });
}

export function getLatestBodyVital() {
  return getJson<{ vital: LatestBodyVital }>('/api/body-measure/vitals/latest', {
    cache: 'no-store',
    credentials: 'include',
  });
}

export function updateLatestBodyVital(input: UpdateLatestBodyVitalInput) {
  return patchJson<{ vital: LatestBodyVital }, UpdateLatestBodyVitalInput>(
    '/api/body-measure/vitals/latest',
    input,
    { cache: 'no-store', credentials: 'include' },
  );
}

export function getBodyVitalHistory() {
  return getJson<{ vitals: NonNullable<LatestBodyVital>[] }>('/api/body-measure/vitals/history', {
    cache: 'no-store',
    credentials: 'include',
  });
}
