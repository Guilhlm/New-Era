import { NextResponse } from 'next/server';

import {
  invalidApiResponse,
  unauthenticatedResponse,
  unreachableApiResponse,
  upstreamErrorResponse,
} from '@/app/api/_lib/api-error';
import { backendApiUrl, getAuthedToken } from '@/app/api/_lib/auth';
import { mapDayPlanToVm, type TrainingDayPlanRecord } from '@/utils/training-mapper';

export async function GET(request: Request) {
  const { token } = await getAuthedToken();
  if (!token) {
    return unauthenticatedResponse();
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
    return unreachableApiResponse();
  }

  const text = await res.text();
  if (!res.ok) {
    return upstreamErrorResponse(text, res.status, 'Failed to load workout day');
  }

  try {
    const parsed = text ? (JSON.parse(text) as TrainingDayPlanRecord | null) : null;
    return NextResponse.json({ plan: mapDayPlanToVm(parsed, weekday) });
  } catch {
    return invalidApiResponse();
  }
}
