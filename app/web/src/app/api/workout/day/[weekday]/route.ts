import { NextResponse } from 'next/server';

import { backendApiUrl, getAuthedUserId } from '@/app/api/_lib/auth';
import { mapDayPlanToVm, type TrainingDayPlanRecord } from '@/utils/training-mapper';

type RouteContext = { params: Promise<{ weekday: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { token } = await getAuthedUserId();
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const weekday = Number((await context.params).weekday);
  if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) {
    return NextResponse.json({ error: 'Invalid weekday' }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const payload: Record<string, unknown> = {};
  if (typeof body.title === 'string') payload.title = body.title.trim();
  if (body.notes === null || typeof body.notes === 'string') payload.notes = body.notes;
  if (typeof body.isActive === 'boolean') payload.isActive = body.isActive;

  let res: Response;
  try {
    res = await fetch(`${backendApiUrl}/workout/day/${weekday}`, {
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
    return NextResponse.json({ error: text || 'Failed to update workout day' }, { status: res.status });
  }

  try {
    return NextResponse.json({
      plan: mapDayPlanToVm(JSON.parse(text) as TrainingDayPlanRecord, weekday),
    });
  } catch {
    return NextResponse.json({ error: 'Invalid API response' }, { status: 502 });
  }
}
