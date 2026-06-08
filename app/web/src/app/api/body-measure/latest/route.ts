import { NextResponse } from 'next/server';

import { backendApiUrl, getAuthedUserId } from '@/app/api/_lib/auth';
import {
  buildMeasureSnapshot,
  byRecordedAtDesc,
  fetchUserMeasures,
  pickMeasurePatch,
  type BodyMeasureRecord,
} from '@/app/api/body-measure/_lib/measures';

export async function GET() {
  const { token, userId } = await getAuthedUserId();
  if (!token || !userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const measures = await fetchUserMeasures(token, userId);
    const latest = measures.sort(byRecordedAtDesc)[0];
    return NextResponse.json({ measure: latest ?? null });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load measures';
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

  const updates = pickMeasurePatch(body);
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  let measures: BodyMeasureRecord[];
  try {
    measures = await fetchUserMeasures(token, userId);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load measures';
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const latest = measures.sort(byRecordedAtDesc)[0];
  const payload = buildMeasureSnapshot(userId, latest, updates);

  const createRes = await fetch(`${backendApiUrl}/body-measure/measures`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const text = await createRes.text();
  if (!createRes.ok) {
    return NextResponse.json({ error: text || 'Failed to save measure' }, { status: createRes.status });
  }

  try {
    const created = JSON.parse(text) as BodyMeasureRecord;
    return NextResponse.json({ measure: created });
  } catch {
    return NextResponse.json({ error: 'Invalid API response' }, { status: 502 });
  }
}
