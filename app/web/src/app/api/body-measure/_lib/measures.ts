import { backendApiUrl } from '@/app/api/_lib/auth';

export type BodyMeasureRecord = {
  id: string;
  userId: string;
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
};

export const MEASURE_PATCH_KEYS = [
  'weight',
  'height',
  'calfRight',
  'calfLeft',
  'quadRight',
  'quadLeft',
  'waist',
  'abdomen',
  'back',
  'chest',
  'shoulderCircumference',
  'neckCircumference',
  'bicepsRight',
  'bicepsLeft',
  'forearmRight',
  'forearmLeft',
] as const;

export function pickMeasurePatch(body: Record<string, unknown>) {
  const payload: Record<string, unknown> = {};
  for (const key of MEASURE_PATCH_KEYS) {
    if (key in body) payload[key] = body[key];
  }
  return payload;
}

export function byRecordedAtDesc(a: BodyMeasureRecord, b: BodyMeasureRecord) {
  const da = a.recordedAt ? Date.parse(a.recordedAt) : 0;
  const db = b.recordedAt ? Date.parse(b.recordedAt) : 0;
  return db - da;
}

export function byRecordedAtAsc(a: BodyMeasureRecord, b: BodyMeasureRecord) {
  return -byRecordedAtDesc(a, b);
}

export async function fetchUserMeasures(token: string, _userId: string) {
  const res = await fetch(`${backendApiUrl}/body-measure/measures`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to load measures');
  }

  return (await res.json()) as BodyMeasureRecord[];
}

export function buildMeasureSnapshot(
  userId: string,
  latest: BodyMeasureRecord | undefined,
  updates: Record<string, unknown>,
) {
  const payload: Record<string, unknown> = { userId };
  for (const key of MEASURE_PATCH_KEYS) {
    if (key in updates) payload[key] = updates[key];
    else if (latest && key in latest) payload[key] = latest[key as keyof BodyMeasureRecord];
  }
  return payload;
}
