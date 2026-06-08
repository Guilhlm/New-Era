import { NextResponse } from 'next/server';

import { backendApiUrl, getAuthedUserId } from '@/app/api/_lib/auth';
import { mapDayPlanToVm, type TrainingDayPlanRecord } from '@/utils/training-mapper';

export async function GET(request: Request) {
  const { token } = await getAuthedUserId();
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const weekday = Number(new URL(request.url).searchParams.get('weekday'));
  if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) {
    return NextResponse.json({ error: 'Invalid weekday' }, { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch(`${backendApiUrl}/workout?weekday=${weekday}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
  } catch {
    return NextResponse.json({ error: 'Unable to reach the API.' }, { status: 503 });
  }

  const text = await res.text();
  if (!res.ok) {
    return NextResponse.json({ error: text || 'Failed to load workout day' }, { status: res.status });
  }

  try {
    const parsed = text ? (JSON.parse(text) as TrainingDayPlanRecord | null) : null;
    return NextResponse.json({ plan: mapDayPlanToVm(parsed, weekday) });
  } catch {
    return NextResponse.json({ error: 'Invalid API response' }, { status: 502 });
  }
}
