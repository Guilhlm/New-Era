import { NextResponse } from 'next/server';

import { proxyFinanceWrite } from '@/app/api/finance/_lib/proxy';

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const payload: Record<string, unknown> = {};
  if (typeof body.ticker === 'string') payload.ticker = body.ticker.trim();
  if (typeof body.shares === 'number') payload.shares = body.shares;
  if (typeof body.costTotal === 'number') payload.costTotal = body.costTotal;
  if (typeof body.avgPrice === 'number') payload.avgPrice = body.avgPrice;
  if (typeof body.costCurrency === 'string') payload.costCurrency = body.costCurrency;
  if (typeof body.name === 'string') payload.name = body.name.trim();
  if (typeof body.type === 'string') payload.type = body.type;
  if (typeof body.notes === 'string') payload.notes = body.notes;

  return proxyFinanceWrite('/finance/investments/register', 'POST', payload);
}
