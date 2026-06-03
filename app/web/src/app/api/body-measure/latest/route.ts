import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { appConfig } from '@/config';

const API = appConfig.apiUrl.replace(/\/$/, '');

type Measure = {
  id: string;
  userId: string;
  recordedAt?: string;
  weight?: string | number | null;
  height?: string | number | null;
};

/** Campos atualizáveis de BodyMeasure (sem id/userId). */
const MEASURE_PATCH_KEYS = [
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

function pickMeasurePatch(body: Record<string, unknown>) {
  const payload: Record<string, unknown> = {};
  for (const key of MEASURE_PATCH_KEYS) {
    if (key in body) payload[key] = body[key];
  }
  return payload;
}

async function getAuthedUserId() {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) return { token: null, userId: null };

  const meRes = await fetch(`${API}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!meRes.ok) return { token: null, userId: null };

  const me = (await meRes.json()) as { id?: string };
  return { token, userId: me?.id ?? null };
}

function byRecordedAtDesc(a: Measure, b: Measure) {
  const da = a.recordedAt ? Date.parse(a.recordedAt) : 0;
  const db = b.recordedAt ? Date.parse(b.recordedAt) : 0;
  return db - da;
}

export async function GET() {
  const { token, userId } = await getAuthedUserId();
  if (!token || !userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const res = await fetch(`${API}/body-measure/measures`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: text || 'Failed to load measures' }, { status: res.status });
  }

  const measures = (await res.json()) as Measure[];
  const latest = measures
    .filter((m) => m.userId === userId)
    .sort(byRecordedAtDesc)[0];

  return NextResponse.json({ measure: latest ?? null });
}

export async function PATCH(request: Request) {
  const { token, userId } = await getAuthedUserId();
  if (!token || !userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const updates = pickMeasurePatch(body);
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  const listRes = await fetch(`${API}/body-measure/measures`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!listRes.ok) {
    const text = await listRes.text();
    return NextResponse.json({ error: text || 'Failed to load measures' }, { status: listRes.status });
  }

  const measures = (await listRes.json()) as Measure[];
  const latest = measures
    .filter((m) => m.userId === userId)
    .sort(byRecordedAtDesc)[0];

  const payload: Record<string, unknown> = { userId, ...updates };

  if (!latest?.id) {
    const createRes = await fetch(`${API}/body-measure/measures`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const text = await createRes.text();
    if (!createRes.ok) {
      return NextResponse.json({ error: text || 'Failed to create measure' }, { status: createRes.status });
    }
    try {
      const created = JSON.parse(text) as Measure;
      return NextResponse.json({ measure: created });
    } catch {
      return NextResponse.json({ error: 'Invalid API response' }, { status: 502 });
    }
  }

  const patchRes = await fetch(`${API}/body-measure/measures/${latest.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const text = await patchRes.text();
  if (!patchRes.ok) {
    return NextResponse.json({ error: text || 'Failed to update measure' }, { status: patchRes.status });
  }

  try {
    const updated = JSON.parse(text) as Measure;
    return NextResponse.json({ measure: updated });
  } catch {
    return NextResponse.json({ error: 'Invalid API response' }, { status: 502 });
  }
}

