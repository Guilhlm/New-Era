import { NextResponse } from 'next/server';

import {
  unauthenticatedResponse,
  upstreamErrorResponse,
} from '@/app/api/_lib/api-error';
import { getAuthedToken } from '@/app/api/_lib/auth';
import { byRecordedAtAsc, fetchUserMeasures } from '@/app/api/body-measure/_lib/measures';

export async function GET() {
  const { token } = await getAuthedToken();
  if (!token) {
    return unauthenticatedResponse();
  }

  try {
    const measures = await fetchUserMeasures(token, '');
    return NextResponse.json({ measures: measures.sort(byRecordedAtAsc) });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    return upstreamErrorResponse(message, 502, 'Failed to load measures');
  }
}
