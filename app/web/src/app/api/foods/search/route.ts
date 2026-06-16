import { NextResponse } from 'next/server';

import { unauthenticatedResponse } from '@/app/api/_lib/api-error';
import { getAuthedToken } from '@/app/api/_lib/auth';
import { searchFoods } from '@/app/api/foods/_lib/taco-search';

function parseLimit(raw: string | null) {
  const limit = Number(raw ?? 10);
  if (!Number.isFinite(limit)) return 10;
  return Math.min(20, Math.max(1, Math.floor(limit)));
}

export async function GET(request: Request) {
  const { token } = await getAuthedToken();
  if (!token) {
    return unauthenticatedResponse();
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
