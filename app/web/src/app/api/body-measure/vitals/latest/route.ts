import { NextResponse } from 'next/server';

import { backendApiUrl, getAuthedUserId } from '@/app/api/_lib/auth';
import {
  buildVitalSnapshot,
  byVitalRecordedAtDesc,
  fetchUserVitals,
  pickVitalPatch,
  type BodyVitalRecord,
} from '@/app/api/body-measure/_lib/vitals';

export async function GET() {
  const { token, userId } = await getAuthedUserId();
  if (!token || !userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const vitals = await fetchUserVitals(token, userId);
    const latest = vitals.sort(byVitalRecordedAtDesc)[0];
    return NextResponse.json({ vital: latest ?? null });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load vitals';
    return NextResponse.json({ error: message }, { status: 502 });
  }
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

  const updates = pickVitalPatch(body);
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  let vitals: BodyVitalRecord[];
  try {
    vitals = await fetchUserVitals(token, userId);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load vitals';
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const latest = vitals.sort(byVitalRecordedAtDesc)[0];
  const payload = buildVitalSnapshot(userId, latest, updates);

  const createRes = await fetch(`${backendApiUrl}/body-measure/vitals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const text = await createRes.text();
  if (!createRes.ok) {
    return NextResponse.json({ error: text || 'Failed to save vitals' }, { status: 502 });
  }

  try {
    const created = JSON.parse(text) as BodyVitalRecord;
    return NextResponse.json({ vital: created });
  } catch {
    return NextResponse.json({ error: 'Invalid API response' }, { status: 502 });
  }
}
