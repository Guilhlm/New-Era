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

type RouteContext = { params: Promise<{ groupId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { token } = await getAuthedToken();
  if (!token) {
    return unauthenticatedResponse();
  }

  const { groupId } = await context.params;
  if (!isValidResourceId(groupId)) {
    return invalidIdResponse();
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const exerciseIds = Array.isArray(body.exerciseIds)
    ? body.exerciseIds.filter((id): id is string => typeof id === 'string' && id.length > 0)
    : [];

  if (exerciseIds.length === 0) {
    return NextResponse.json({ error: 'Exercise order is required' }, { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch(
      `${backendApiUrl}/workout/groups/${encodeURIComponent(groupId)}/exercises/reorder`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ exerciseIds }),
        cache: 'no-store',
      },
    );
  } catch {
    return unreachableApiResponse();
  }

  const text = await res.text();
  if (!res.ok) {
    return upstreamErrorResponse(text, res.status, 'Failed to reorder exercises');
  }

  try {
    const records = JSON.parse(text) as TrainingExerciseRecord[];
    return NextResponse.json({
      exercises: records.map(mapExerciseToVm),
    });
  } catch {
    return invalidApiResponse();
  }
}
