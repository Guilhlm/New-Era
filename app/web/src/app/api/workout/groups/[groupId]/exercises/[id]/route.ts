import { NextResponse } from 'next/server';

import {
  invalidApiResponse,
  unauthenticatedResponse,
  unreachableApiResponse,
  upstreamErrorResponse,
} from '@/app/api/_lib/api-error';
import { backendApiUrl, getAuthedToken } from '@/app/api/_lib/auth';
import { invalidIdResponse, isValidResourceId } from '@/app/api/_lib/params';
import { mapExerciseToVm, type TrainingExerciseRecord } from '@/utils/training-mapper';

type RouteContext = { params: Promise<{ groupId: string; id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { token } = await getAuthedToken();
  if (!token) {
    return unauthenticatedResponse();
  }

  const { groupId, id } = await context.params;
  if (!isValidResourceId(groupId) || !isValidResourceId(id)) {
    return invalidIdResponse();
  }

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
    res = await fetch(
      `${backendApiUrl}/workout/groups/${encodeURIComponent(groupId)}/exercises/${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        cache: 'no-store',
      },
    );
  } catch {
    return unreachableApiResponse();
  }

  const text = await res.text();
  if (!res.ok) {
    return upstreamErrorResponse(text, res.status, 'Failed to update exercise');
  }

  try {
    return NextResponse.json({
      exercise: mapExerciseToVm(JSON.parse(text) as TrainingExerciseRecord),
    });
  } catch {
    return invalidApiResponse();
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { token } = await getAuthedToken();
  if (!token) {
    return unauthenticatedResponse();
  }

  const { groupId, id } = await context.params;
  if (!isValidResourceId(groupId) || !isValidResourceId(id)) {
    return invalidIdResponse();
  }

  let res: Response;
  try {
    res = await fetch(
      `${backendApiUrl}/workout/groups/${encodeURIComponent(groupId)}/exercises/${encodeURIComponent(id)}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      },
    );
  } catch {
    return unreachableApiResponse();
  }

  if (!res.ok) {
    const text = await res.text();
    return upstreamErrorResponse(text, res.status, 'Failed to delete exercise');
  }

  return NextResponse.json({ ok: true });
}
