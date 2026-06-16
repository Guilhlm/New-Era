import { NextResponse } from 'next/server';

import {
  invalidApiResponse,
  unauthenticatedResponse,
  upstreamErrorResponse,
} from '@/app/api/_lib/api-error';
import { backendApiUrl, getAuthedToken } from '@/app/api/_lib/auth';
import {
  buildVitalSnapshot,
  fetchLatestVital,
  pickVitalPatch,
  type BodyVitalRecord,
} from '@/app/api/body-measure/_lib/vitals';

export async function GET() {
  const { token } = await getAuthedToken();
  if (!token) {
    return unauthenticatedResponse();
  }

  try {
    const latest = await fetchLatestVital(token);
    return NextResponse.json({ vital: latest ?? null });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    return upstreamErrorResponse(message, 502, 'Failed to load vitals');
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

  const updates = pickVitalPatch(body);
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  let latest: BodyVitalRecord | null;
  try {
    latest = await fetchLatestVital(token);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    return upstreamErrorResponse(message, 502, 'Failed to load vitals');
  }

  const payload = buildVitalSnapshot('', latest ?? undefined, updates);

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
    return upstreamErrorResponse(text, 502, 'Failed to save vitals');
  }

  try {
    const created = JSON.parse(text) as BodyVitalRecord;
    return NextResponse.json({ vital: created });
  } catch {
    return invalidApiResponse();
  }
}
