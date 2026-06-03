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
