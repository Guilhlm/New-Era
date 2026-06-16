import { NextResponse } from 'next/server';

import { proxyFinanceWrite } from '@/app/api/finance/_lib/proxy';

const VALID_CURRENCIES = new Set(['USDT', 'BRL']);

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const payload: Record<string, unknown> = {};
  if (typeof body.amount === 'number') payload.amount = body.amount;
  if (typeof body.currency === 'string' && VALID_CURRENCIES.has(body.currency)) {
    payload.currency = body.currency;
  }
  if (typeof body.walletId === 'string') payload.walletId = body.walletId;
  if (typeof body.description === 'string') payload.description = body.description.trim();

  return proxyFinanceWrite('/finance/investments/deposit', 'POST', payload);
}
