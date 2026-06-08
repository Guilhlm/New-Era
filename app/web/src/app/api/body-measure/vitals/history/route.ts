import { NextResponse } from 'next/server';

import { getAuthedUserId } from '@/app/api/_lib/auth';
import { byVitalRecordedAtAsc, fetchUserVitals } from '@/app/api/body-measure/_lib/vitals';

export async function GET() {
  const { token, userId } = await getAuthedUserId();
  if (!token || !userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const vitals = await fetchUserVitals(token, userId);
    return NextResponse.json({ vitals: vitals.sort(byVitalRecordedAtAsc) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load vitals';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
