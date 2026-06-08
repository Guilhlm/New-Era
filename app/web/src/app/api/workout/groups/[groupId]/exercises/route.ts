import { NextResponse } from 'next/server';

import { backendApiUrl, getAuthedUserId } from '@/app/api/_lib/auth';
import { mapExerciseToVm, type TrainingExerciseRecord } from '@/utils/training-mapper';

type RouteContext = { params: Promise<{ groupId: string }> };

export async function POST(request: Request, context: RouteContext) {
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

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name) {
    return NextResponse.json({ error: 'Exercise name is required' }, { status: 400 });
  }

  const payload = {
    name,
    equipment: typeof body.equipment === 'string' ? body.equipment.trim() || null : null,
    weightKg: body.weightKg === null || body.weightKg === undefined ? null : Number(body.weightKg),
    series: body.series === null || body.series === undefined ? null : Number(body.series),
    repsMin: body.repsMin === null || body.repsMin === undefined ? null : Number(body.repsMin),
    repsMax: body.repsMax === null || body.repsMax === undefined ? null : Number(body.repsMax),
    imageUrl: typeof body.imageUrl === 'string' ? body.imageUrl : null,
  };

  let res: Response;
  try {
    res = await fetch(`${backendApiUrl}/workout/groups/${groupId}/exercises`, {
      method: 'POST',
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
    return NextResponse.json({ error: text || 'Failed to create exercise' }, { status: res.status });
  }

  try {
    return NextResponse.json({
      exercise: mapExerciseToVm(JSON.parse(text) as TrainingExerciseRecord),
    });
  } catch {
    return NextResponse.json({ error: 'Invalid API response' }, { status: 502 });
  }
}
