import { NextResponse } from 'next/server';

import { proxyFinanceGet, proxyFinanceWrite } from '@/app/api/finance/_lib/proxy';

const VALID_TABS = new Set(['stocks', 'crypto', 'etfs', 'mine']);

export async function GET(request: Request) {
  const rawTab = new URL(request.url).searchParams.get('tab');
  const tab = rawTab === 'others' ? 'mine' : rawTab;
  const path =
    tab && VALID_TABS.has(tab)
      ? `/finance/investments?tab=${encodeURIComponent(tab)}`
      : '/finance/investments';
  return proxyFinanceGet(path);
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const payload: Record<string, unknown> = {};
  if (typeof body.ticker === 'string') payload.ticker = body.ticker.trim();
  if (typeof body.name === 'string') payload.name = body.name.trim();
  if (typeof body.type === 'string') payload.type = body.type;
  if (typeof body.shares === 'number') payload.shares = body.shares;
  if (typeof body.avgPrice === 'number') payload.avgPrice = body.avgPrice;
  if (typeof body.currentPrice === 'number') payload.currentPrice = body.currentPrice;
  if (typeof body.lastAction === 'string') payload.lastAction = body.lastAction;
  if (typeof body.notes === 'string') payload.notes = body.notes;

  return proxyFinanceWrite('/finance/investments', 'POST', payload);
}
