import { NextResponse } from 'next/server';

import {
  invalidApiResponse,
  unauthenticatedResponse,
  unreachableApiResponse,
  upstreamErrorResponse,
} from '@/app/api/_lib/api-error';
import { backendApiUrl, getAuthedToken } from '@/app/api/_lib/auth';
import { invalidIdResponse, isValidResourceId } from '@/app/api/_lib/params';
import { mapGroupToVm, type TrainingMuscleGroupRecord } from '@/utils/training-mapper';

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

  const payload: Record<string, unknown> = {};
  if (typeof body.name === 'string') payload.name = body.name.trim();
  if (body.timeMinutes === null || body.timeMinutes !== undefined) {
    payload.timeMinutes =
      body.timeMinutes === null ? null : Number(body.timeMinutes);
  }

  let res: Response;
  try {
    res = await fetch(`${backendApiUrl}/workout/groups/${encodeURIComponent(groupId)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });
  } catch {
    return unreachableApiResponse();
  }

  const text = await res.text();
  if (!res.ok) {
    return upstreamErrorResponse(text, res.status, 'Failed to update group');
  }

  try {
    return NextResponse.json({ group: mapGroupToVm(JSON.parse(text) as TrainingMuscleGroupRecord) });
  } catch {
    return invalidApiResponse();
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { token } = await getAuthedToken();
  if (!token) {
    return unauthenticatedResponse();
  }

  const { groupId } = await context.params;
  if (!isValidResourceId(groupId)) {
    return invalidIdResponse();
  }

  let res: Response;
  try {
    res = await fetch(`${backendApiUrl}/workout/groups/${encodeURIComponent(groupId)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
  } catch {
    return unreachableApiResponse();
  }

  if (!res.ok) {
    const text = await res.text();
    return upstreamErrorResponse(text, res.status, 'Failed to delete group');
  }

  return NextResponse.json({ ok: true });
}
