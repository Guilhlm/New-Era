import { NextResponse } from 'next/server';

import { backendApiUrl, getAuthedUserId } from '@/app/api/_lib/auth';
import { mapGroupToVm, type TrainingMuscleGroupRecord } from '@/utils/training-mapper';

export async function POST(request: Request) {
  const { token } = await getAuthedUserId();
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
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
    return NextResponse.json({ error: 'Unable to reach the API.' }, { status: 503 });
  }

  const text = await res.text();
  if (!res.ok) {
    return NextResponse.json({ error: text || 'Failed to create group' }, { status: res.status });
  }

  try {
    return NextResponse.json({ group: mapGroupToVm(JSON.parse(text) as TrainingMuscleGroupRecord) });
  } catch {
    return NextResponse.json({ error: 'Invalid API response' }, { status: 502 });
  }
}
