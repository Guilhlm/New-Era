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

export function buildVitalSnapshot(
  userId: string,
  latest: BodyVitalRecord | undefined,
  updates: Record<string, unknown>,
) {
  const payload: Record<string, unknown> = { userId };
  for (const key of VITAL_PATCH_KEYS) {
    if (key in updates) payload[key] = updates[key];
    else if (latest && key in latest) payload[key] = latest[key as keyof BodyVitalRecord];
  }
  return payload;
}
