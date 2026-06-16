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

export async function fetchLatestMeasure(token: string) {
  const res = await fetch(`${backendApiUrl}/body-measure/measures/latest`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to load latest measure');
  }

  const latest = (await res.json()) as BodyMeasureRecord | null;
  return latest;
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

function toOptionalNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const n = typeof value === 'number' ? value : Number(String(value).replace(',', '.'));
  return Number.isFinite(n) ? n : undefined;
}

/** Builds a NestJS-safe payload (no userId; numeric fields coerced). */
export function buildMeasureSnapshot(
  _userId: string,
  latest: BodyMeasureRecord | undefined,
  updates: Record<string, unknown>,
) {
  const payload: Record<string, unknown> = {};
  for (const key of MEASURE_PATCH_KEYS) {
    const fromUpdate = key in updates;
    const raw = fromUpdate ? updates[key] : latest?.[key as keyof BodyMeasureRecord];
    if (fromUpdate && updates[key] === null) {
      payload[key] = null;
      continue;
    }
    const n = toOptionalNumber(raw);
    if (n !== undefined) payload[key] = n;
  }
  return payload;
}
