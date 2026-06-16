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
  if (typeof body.name === 'string') payload.name = body.name.trim();
  if (typeof body.type === 'string') payload.type = body.type;
  if (typeof body.action === 'string') payload.action = body.action;
  if (typeof body.shares === 'number') payload.shares = body.shares;
  if (typeof body.price === 'number') payload.price = body.price;
  if (typeof body.budgetUsdt === 'number') payload.budgetUsdt = body.budgetUsdt;

  return proxyFinanceWrite('/finance/market/preview', 'POST', payload);
}
