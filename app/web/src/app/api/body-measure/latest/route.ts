import { NextResponse } from 'next/server';

import {
  invalidApiResponse,
  unauthenticatedResponse,
  upstreamErrorResponse,
} from '@/app/api/_lib/api-error';
import { backendApiUrl, getAuthedToken } from '@/app/api/_lib/auth';
import {
  buildMeasureSnapshot,
  fetchLatestMeasure,
  pickMeasurePatch,
  type BodyMeasureRecord,
} from '@/app/api/body-measure/_lib/measures';

export async function GET() {
  const { token } = await getAuthedToken();
  if (!token) {
    return unauthenticatedResponse();
  }

  try {
    const latest = await fetchLatestMeasure(token);
    return NextResponse.json({ measure: latest ?? null });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    return upstreamErrorResponse(message, 502, 'Failed to load measures');
  }
}

export async function PATCH(request: Request) {
  const { token } = await getAuthedToken();
  if (!token) {
    return unauthenticatedResponse();
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

  let latest: BodyMeasureRecord | null;
  try {
    latest = await fetchLatestMeasure(token);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    return upstreamErrorResponse(message, 502, 'Failed to load measures');
  }

  const payload = buildMeasureSnapshot('', latest ?? undefined, updates);

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
    return upstreamErrorResponse(text, createRes.status, 'Failed to save measure');
  }

  try {
    const created = JSON.parse(text) as BodyMeasureRecord;
    return NextResponse.json({ measure: created });
  } catch {
    return invalidApiResponse();
  }
}
