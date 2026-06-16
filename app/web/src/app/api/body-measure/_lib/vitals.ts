import { backendApiUrl } from '@/app/api/_lib/auth';

export type BodyVitalRecord = {
  id: string;
  userId: string;
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
};

export const VITAL_PATCH_KEYS = [
  'bodyFat',
  'bodyWater',
  'leanMass',
  'boneMass',
  'restingHeartRate',
  'maxHeartRate',
  'basalMetabolicRate',
  'hydrationLevel',
  'sleepHours',
] as const;

export function pickVitalPatch(body: Record<string, unknown>) {
  const payload: Record<string, unknown> = {};
  for (const key of VITAL_PATCH_KEYS) {
    if (key in body) payload[key] = body[key];
  }
  return payload;
}

export function byVitalRecordedAtDesc(a: BodyVitalRecord, b: BodyVitalRecord) {
  const da = a.recordedAt ? Date.parse(a.recordedAt) : 0;
  const db = b.recordedAt ? Date.parse(b.recordedAt) : 0;
  return db - da;
}

export function byVitalRecordedAtAsc(a: BodyVitalRecord, b: BodyVitalRecord) {
  return -byVitalRecordedAtDesc(a, b);
}

export async function fetchLatestVital(token: string) {
  const res = await fetch(`${backendApiUrl}/body-measure/vitals/latest`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to load latest vital');
  }

  const latest = (await res.json()) as BodyVitalRecord | null;
  return latest;
}

export async function fetchUserVitals(token: string, _userId: string) {
  const res = await fetch(`${backendApiUrl}/body-measure/vitals`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to load vitals');
  }

  return (await res.json()) as BodyVitalRecord[];
}

function toOptionalNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const n = typeof value === 'number' ? value : Number(String(value).replace(',', '.'));
  return Number.isFinite(n) ? n : undefined;
}

function toOptionalInt(value: unknown): number | undefined {
  const n = toOptionalNumber(value);
  return n === undefined ? undefined : Math.trunc(n);
}

/** Builds a NestJS-safe payload (no userId; numeric fields coerced). */
export function buildVitalSnapshot(
  _userId: string,
  latest: BodyVitalRecord | undefined,
  updates: Record<string, unknown>,
) {
  const payload: Record<string, unknown> = {};
  const intKeys = new Set(['restingHeartRate', 'maxHeartRate', 'basalMetabolicRate']);

  for (const key of VITAL_PATCH_KEYS) {
    const raw = key in updates ? updates[key] : latest?.[key as keyof BodyVitalRecord];
    if (raw === null) {
      payload[key] = null;
      continue;
    }
    const n = intKeys.has(key) ? toOptionalInt(raw) : toOptionalNumber(raw);
    if (n !== undefined) payload[key] = n;
  }
  return payload;
}
