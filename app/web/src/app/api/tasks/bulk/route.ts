import { NextResponse } from 'next/server';

import {
  invalidApiResponse,
  unauthenticatedResponse,
  unreachableApiResponse,
  upstreamErrorResponse,
} from '@/app/api/_lib/api-error';
import { backendApiUrl, getAuthedToken } from '@/app/api/_lib/auth';
import { mapTasksToVm, type DailyTaskRecord } from '@/utils/task-mapper';

export async function POST(request: Request) {
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

  const weekday = Number(body.weekday);
  const tasks = Array.isArray(body.tasks) ? body.tasks : [];

  if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) {
    return NextResponse.json({ error: 'Invalid weekday' }, { status: 400 });
  }
  if (tasks.length === 0) {
    return NextResponse.json({ error: 'At least one task is required' }, { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch(`${backendApiUrl}/tasks/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ weekday, tasks }),
      cache: 'no-store',
    });
  } catch {
    return unreachableApiResponse();
  }

  const text = await res.text();
  if (!res.ok) {
    return upstreamErrorResponse(text, res.status, 'Failed to create tasks');
  }

  try {
    const parsed = text ? (JSON.parse(text) as DailyTaskRecord[]) : [];
    return NextResponse.json({ tasks: mapTasksToVm(parsed) });
  } catch {
    return invalidApiResponse();
  }
}
