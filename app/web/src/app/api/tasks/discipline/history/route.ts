import { NextResponse } from 'next/server';

import {
  invalidApiResponse,
  unauthenticatedResponse,
  unreachableApiResponse,
  upstreamErrorResponse,
} from '@/app/api/_lib/api-error';
import { backendApiUrl, getAuthedToken } from '@/app/api/_lib/auth';
import {
  mapDisciplineHistoryToVm,
  type TaskDisciplineDayRecord,
} from '@/utils/task-mapper';

export async function GET(request: Request) {
  const { token } = await getAuthedToken();
  if (!token) {
    return unauthenticatedResponse();
  }

  const url = new URL(request.url);
  const daysRaw = Number(url.searchParams.get('days'));
  const days = daysRaw === 14 || daysRaw === 30 ? daysRaw : 7;
  const tabParam = url.searchParams.get('tab');
  const tab =
    tabParam === 'financial' ? 'financial' : tabParam === 'diet' ? 'diet' : 'training';

  let res: Response;
  try {
    res = await fetch(`${backendApiUrl}/tasks/discipline/history?days=${days}&tab=${tab}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
  } catch {
    return unreachableApiResponse();
  }

  const text = await res.text();
  if (!res.ok) {
    return upstreamErrorResponse(text, res.status, 'Failed to load discipline history');
  }

  try {
    const parsed = text ? (JSON.parse(text) as TaskDisciplineDayRecord[]) : [];
    return NextResponse.json({ days: mapDisciplineHistoryToVm(parsed) });
  } catch {
    return invalidApiResponse();
  }
}
