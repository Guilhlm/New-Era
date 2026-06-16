import { NextResponse } from 'next/server';

import {
  invalidApiResponse,
  unauthenticatedResponse,
  unreachableApiResponse,
  upstreamErrorResponse,
} from '@/app/api/_lib/api-error';
import { backendApiUrl, getAuthedToken } from '@/app/api/_lib/auth';
import { mapPlanSummaryToVm, type TrainingPlanSummaryRecord } from '@/utils/training-mapper';

export async function GET() {
  const { token } = await getAuthedToken();
  if (!token) {
    return unauthenticatedResponse();
  }

  let res: Response;
  try {
    res = await fetch(`${backendApiUrl}/workout/plan`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
  } catch {
    return unreachableApiResponse();
  }

  const text = await res.text();
  if (!res.ok) {
    return upstreamErrorResponse(text, res.status, 'Failed to load workout plan');
  }

  try {
    const records = JSON.parse(text) as TrainingPlanSummaryRecord[];
    return NextResponse.json({ days: records.map(mapPlanSummaryToVm) });
  } catch {
    return invalidApiResponse();
  }
}
