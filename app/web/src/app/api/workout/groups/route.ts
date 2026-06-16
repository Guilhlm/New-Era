import { NextResponse } from 'next/server';

import {
  invalidApiResponse,
  unauthenticatedResponse,
  unreachableApiResponse,
  upstreamErrorResponse,
} from '@/app/api/_lib/api-error';
import { backendApiUrl, getAuthedToken } from '@/app/api/_lib/auth';
import { mapGroupToVm, type TrainingMuscleGroupRecord } from '@/utils/training-mapper';

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

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const weekday = Number(body.weekday);
  const timeMinutes =
    body.timeMinutes === null || body.timeMinutes === undefined
      ? null
      : Number(body.timeMinutes);

  if (!name) {
    return NextResponse.json({ error: 'Group name is required' }, { status: 400 });
  }
  if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) {
    return NextResponse.json({ error: 'Invalid weekday' }, { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch(`${backendApiUrl}/workout/groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        weekday,
        timeMinutes: Number.isFinite(timeMinutes) ? timeMinutes : null,
      }),
      cache: 'no-store',
    });
  } catch {
    return unreachableApiResponse();
  }

  const text = await res.text();
  if (!res.ok) {
    return upstreamErrorResponse(text, res.status, 'Failed to create group');
  }

  try {
    return NextResponse.json({ group: mapGroupToVm(JSON.parse(text) as TrainingMuscleGroupRecord) });
  } catch {
    return invalidApiResponse();
  }
}
