import { NextResponse } from 'next/server';

import {
  unauthenticatedResponse,
  upstreamErrorResponse,
} from '@/app/api/_lib/api-error';
import { getAuthedToken } from '@/app/api/_lib/auth';
import { byVitalRecordedAtAsc, fetchUserVitals } from '@/app/api/body-measure/_lib/vitals';

export async function GET() {
  const { token } = await getAuthedToken();
  if (!token) {
    return unauthenticatedResponse();
  }

  try {
    const vitals = await fetchUserVitals(token, '');
    return NextResponse.json({ vitals: vitals.sort(byVitalRecordedAtAsc) });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    return upstreamErrorResponse(message, 502, 'Failed to load vitals');
  }
}
