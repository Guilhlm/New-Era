import { NextResponse } from 'next/server';

import { getAuthedUserId } from '@/app/api/_lib/auth';
import { searchFoods } from '@/app/api/foods/_lib/taco-search';

function parseLimit(raw: string | null) {
  const limit = Number(raw ?? 10);
  if (!Number.isFinite(limit)) return 10;
  return Math.min(20, Math.max(1, Math.floor(limit)));
}

export async function GET(request: Request) {
  const { token } = await getAuthedUserId();
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() ?? '';
  const limit = parseLimit(searchParams.get('limit'));

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const { results } = await searchFoods(q, limit);
  return NextResponse.json({ results });
}
