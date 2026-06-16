import { NextResponse } from 'next/server';

import {
  invalidApiResponse,
  unauthenticatedResponse,
  unreachableApiResponse,
  upstreamErrorResponse,
} from '@/app/api/_lib/api-error';
import { backendApiUrl, getAuthedToken } from '@/app/api/_lib/auth';
import { invalidIdResponse, isValidResourceId } from '@/app/api/_lib/params';
import { mapTaskToVm, type DailyTaskRecord } from '@/utils/task-mapper';

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { token } = await getAuthedToken();
  if (!token) {
    return unauthenticatedResponse();
  }

  const { id } = await context.params;
  if (!isValidResourceId(id)) {
    return invalidIdResponse();
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const payload: Record<string, unknown> = {};
  if (typeof body.title === 'string') payload.title = body.title.trim();
  if (typeof body.scheduledAt === 'string') payload.scheduledAt = body.scheduledAt.trim();
  if (typeof body.isActive === 'boolean') payload.isActive = body.isActive;

  let res: Response;
  try {
    res = await fetch(`${backendApiUrl}/tasks/${encodeURIComponent(id)}`, {
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
    return upstreamErrorResponse(text, res.status, 'Failed to update task');
  }

  try {
    return NextResponse.json({ task: mapTaskToVm(JSON.parse(text) as DailyTaskRecord) });
  } catch {
    return invalidApiResponse();
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { token } = await getAuthedToken();
  if (!token) {
    return unauthenticatedResponse();
  }

  const { id } = await context.params;
  if (!isValidResourceId(id)) {
    return invalidIdResponse();
  }

  let res: Response;
  try {
    res = await fetch(`${backendApiUrl}/tasks/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
  } catch {
    return unreachableApiResponse();
  }

  if (!res.ok) {
    const text = await res.text();
    return upstreamErrorResponse(text, res.status, 'Failed to delete task');
  }

  return NextResponse.json({ ok: true });
}
