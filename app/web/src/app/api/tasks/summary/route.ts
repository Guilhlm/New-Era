import { NextResponse } from 'next/server';

import {
  invalidApiResponse,
  unauthenticatedResponse,
  unreachableApiResponse,
  upstreamErrorResponse,
} from '@/app/api/_lib/api-error';
import { backendApiUrl, getAuthedToken } from '@/app/api/_lib/auth';

type WeekdaySummaryRecord = {
  weekday: number;
  count: number;
};

export async function GET() {
  const { token } = await getAuthedToken();
  if (!token) {
    return unauthenticatedResponse();
  }

  let res: Response;
  try {
    res = await fetch(`${backendApiUrl}/tasks/summary`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
  } catch {
    return unreachableApiResponse();
  }

  const text = await res.text();
  if (!res.ok) {
    return upstreamErrorResponse(text, res.status, 'Failed to load task summary');
  }

  try {
    const days = text ? (JSON.parse(text) as WeekdaySummaryRecord[]) : [];
    return NextResponse.json({ days });
  } catch {
    return invalidApiResponse();
  }
}
