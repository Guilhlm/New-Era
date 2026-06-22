import { NextResponse } from 'next/server';

import {
  invalidApiResponse,
  unauthenticatedResponse,
  unreachableApiResponse,
  upstreamErrorResponse,
} from '@/app/api/_lib/api-error';
import { backendApiUrl, getAuthedToken } from '@/app/api/_lib/auth';
import { mapMealToVm, type DietMealRecord } from '@/utils/diet-mapper';

function isValidWeekday(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 0 && (value as number) <= 6;
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

  const sourceWeekday = Number(body.sourceWeekday);
  const targetWeekday = Number(body.targetWeekday);
  if (!isValidWeekday(sourceWeekday) || !isValidWeekday(targetWeekday)) {
    return NextResponse.json({ error: 'Invalid weekday' }, { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch(`${backendApiUrl}/diet/copy-day`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ sourceWeekday, targetWeekday }),
      cache: 'no-store',
    });
  } catch {
    return unreachableApiResponse();
  }

  const text = await res.text();
  if (!res.ok) {
    return upstreamErrorResponse(text, res.status, 'Failed to copy diet day');
  }

  try {
    const meals = JSON.parse(text) as DietMealRecord[];
    return NextResponse.json({ meals: meals.map(mapMealToVm) });
  } catch {
    return invalidApiResponse();
  }
}
