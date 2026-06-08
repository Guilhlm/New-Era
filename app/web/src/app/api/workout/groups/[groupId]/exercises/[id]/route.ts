import { NextResponse } from 'next/server';

import { backendApiUrl, getAuthedUserId } from '@/app/api/_lib/auth';
import { mapExerciseToVm, type TrainingExerciseRecord } from '@/utils/training-mapper';

type RouteContext = { params: Promise<{ groupId: string; id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { token } = await getAuthedUserId();
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { groupId, id } = await context.params;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const payload: Record<string, unknown> = {};
  if (typeof body.name === 'string') payload.name = body.name.trim();
  if (body.equipment === null || typeof body.equipment === 'string') {
    payload.equipment = body.equipment;
  }
  if (body.weightKg === null || body.weightKg !== undefined) {
    payload.weightKg = body.weightKg === null ? null : Number(body.weightKg);
  }
  if (body.series === null || body.series !== undefined) {
    payload.series = body.series === null ? null : Number(body.series);
  }
  if (body.repsMin === null || body.repsMin !== undefined) {
    payload.repsMin = body.repsMin === null ? null : Number(body.repsMin);
  }
  if (body.repsMax === null || body.repsMax !== undefined) {
    payload.repsMax = body.repsMax === null ? null : Number(body.repsMax);
  }
  if (typeof body.imageUrl === 'string' || body.imageUrl === null) {
    payload.imageUrl = body.imageUrl;
  }
  if (typeof body.isCompleted === 'boolean') payload.isCompleted = body.isCompleted;

  let res: Response;
  try {
    res = await fetch(`${backendApiUrl}/workout/groups/${groupId}/exercises/${id}`, {
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
    return NextResponse.json({ error: text || 'Failed to update exercise' }, { status: res.status });
  }

  try {
    return NextResponse.json({
      exercise: mapExerciseToVm(JSON.parse(text) as TrainingExerciseRecord),
    });
  } catch {
    return NextResponse.json({ error: 'Invalid API response' }, { status: 502 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { token } = await getAuthedUserId();
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { groupId, id } = await context.params;

  let res: Response;
  try {
    res = await fetch(`${backendApiUrl}/workout/groups/${groupId}/exercises/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
  } catch {
    return NextResponse.json({ error: 'Unable to reach the API.' }, { status: 503 });
  }

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: text || 'Failed to delete exercise' }, { status: res.status });
  }

  return NextResponse.json({ ok: true });
}
