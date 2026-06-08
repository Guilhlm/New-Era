import { NextResponse } from 'next/server';

import { backendApiUrl, getAuthedUserId } from '@/app/api/_lib/auth';
import { mapMealToVm, type DietMealRecord } from '@/utils/diet-mapper';

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
    res = await fetch(`${backendApiUrl}/diet?weekday=${weekday}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
  } catch {
    return NextResponse.json({ error: 'Unable to reach the API.' }, { status: 503 });
  }

  const text = await res.text();
  if (!res.ok) {
    return NextResponse.json({ error: text || 'Failed to load diet day' }, { status: res.status });
  }

  try {
    const meals = JSON.parse(text) as DietMealRecord[];
    return NextResponse.json({ meals: meals.map(mapMealToVm) });
  } catch {
    return NextResponse.json({ error: 'Invalid API response' }, { status: 502 });
  }
}
