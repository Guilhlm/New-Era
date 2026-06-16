import { NextResponse } from 'next/server';

import {
  invalidApiResponse,
  unauthenticatedResponse,
  unreachableApiResponse,
  upstreamErrorResponse,
} from '@/app/api/_lib/api-error';
import { backendApiUrl, getAuthedToken } from '@/app/api/_lib/auth';
import {
  mapTaskToVm,
  mapTasksToVm,
  type DailyTaskRecord,
} from '@/utils/task-mapper';

function parseWeekday(request: Request) {
  const weekday = Number(new URL(request.url).searchParams.get('weekday'));
  if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) return null;
  return weekday;
}

async function proxyGet(path: string, token: string) {
  try {
    return await fetch(`${backendApiUrl}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { token } = await getAuthedToken();
  if (!token) {
    return unauthenticatedResponse();
  }

  const weekday = parseWeekday(request);
  if (weekday === null) {
    return NextResponse.json({ error: 'Invalid weekday' }, { status: 400 });
  }

  const res = await proxyGet(`/tasks?weekday=${weekday}`, token);
  if (!res) {
    return unreachableApiResponse();
  }

  const text = await res.text();
  if (!res.ok) {
    return upstreamErrorResponse(text, res.status, 'Failed to load tasks');
  }

  try {
    const parsed = text ? (JSON.parse(text) as DailyTaskRecord[]) : [];
    return NextResponse.json({ tasks: mapTasksToVm(parsed) });
  } catch {
    return invalidApiResponse();
  }
}

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
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const scheduledAt = typeof body.scheduledAt === 'string' ? body.scheduledAt.trim() : '';

  if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) {
    return NextResponse.json({ error: 'Invalid weekday' }, { status: 400 });
  }
  if (!title || !scheduledAt) {
    return NextResponse.json({ error: 'Title and scheduledAt are required' }, { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch(`${backendApiUrl}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        weekday,
        title,
        scheduledAt,
        sourceType: body.sourceType,
        sourceId: body.sourceId,
      }),
      cache: 'no-store',
    });
  } catch {
    return unreachableApiResponse();
  }

  const text = await res.text();
  if (!res.ok) {
    return upstreamErrorResponse(text, res.status, 'Failed to create task');
  }

  try {
    return NextResponse.json({ task: mapTaskToVm(JSON.parse(text) as DailyTaskRecord) });
  } catch {
    return invalidApiResponse();
  }
}
