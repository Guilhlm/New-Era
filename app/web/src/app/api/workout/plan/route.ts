import { NextResponse } from 'next/server';

import { backendApiUrl, getAuthedUserId } from '@/app/api/_lib/auth';
import { mapPlanSummaryToVm, type TrainingPlanSummaryRecord } from '@/utils/training-mapper';

export async function GET() {
  const { token } = await getAuthedUserId();
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  let res: Response;
  try {
    res = await fetch(`${backendApiUrl}/workout/plan`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
  } catch {
    return NextResponse.json({ error: 'Unable to reach the API.' }, { status: 503 });
  }

  const text = await res.text();
  if (!res.ok) {
    return NextResponse.json({ error: text || 'Failed to load workout plan' }, { status: res.status });
  }

  try {
    const records = JSON.parse(text) as TrainingPlanSummaryRecord[];
    return NextResponse.json({ days: records.map(mapPlanSummaryToVm) });
  } catch {
    return NextResponse.json({ error: 'Invalid API response' }, { status: 502 });
  }
}
