import { NextResponse } from 'next/server';

import { getAuthedUserId } from '@/app/api/_lib/auth';
import { byRecordedAtAsc, fetchUserMeasures } from '@/app/api/body-measure/_lib/measures';

export async function GET() {
  const { token, userId } = await getAuthedUserId();
  if (!token || !userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const measures = await fetchUserMeasures(token, userId);
    return NextResponse.json({ measures: measures.sort(byRecordedAtAsc) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load measures';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
