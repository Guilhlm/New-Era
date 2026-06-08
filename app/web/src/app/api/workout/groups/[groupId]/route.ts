import { NextResponse } from 'next/server';

import { backendApiUrl, getAuthedUserId } from '@/app/api/_lib/auth';
import { mapGroupToVm, type TrainingMuscleGroupRecord } from '@/utils/training-mapper';

type RouteContext = { params: Promise<{ groupId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { token } = await getAuthedUserId();
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { groupId } = await context.params;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const payload: Record<string, unknown> = {};
  if (typeof body.name === 'string') payload.name = body.name.trim();
  if (body.timeMinutes === null || body.timeMinutes !== undefined) {
    payload.timeMinutes =
      body.timeMinutes === null ? null : Number(body.timeMinutes);
  }

  let res: Response;
  try {
    res = await fetch(`${backendApiUrl}/workout/groups/${groupId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });
  } catch {
    return NextResponse.json({ error: 'Unable to reach the API.' }, { status: 503 });
  }

  const text = await res.text();
  if (!res.ok) {
    return NextResponse.json({ error: text || 'Failed to update group' }, { status: res.status });
  }

  try {
    return NextResponse.json({ group: mapGroupToVm(JSON.parse(text) as TrainingMuscleGroupRecord) });
  } catch {
    return NextResponse.json({ error: 'Invalid API response' }, { status: 502 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { token } = await getAuthedUserId();
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { groupId } = await context.params;

  let res: Response;
  try {
    res = await fetch(`${backendApiUrl}/workout/groups/${groupId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
  } catch {
    return NextResponse.json({ error: 'Unable to reach the API.' }, { status: 503 });
  }

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: text || 'Failed to delete group' }, { status: res.status });
  }

  return NextResponse.json({ ok: true });
}
