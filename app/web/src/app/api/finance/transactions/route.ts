import { NextResponse } from 'next/server';

import { proxyFinanceGet, proxyFinanceWrite } from '@/app/api/finance/_lib/proxy';

export async function GET() {
  return proxyFinanceGet('/finance/transactions');
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const payload: Record<string, unknown> = {};
  if (typeof body.type === 'string') payload.type = body.type;
  if (typeof body.amount === 'number') payload.amount = body.amount;
  if (typeof body.description === 'string') payload.description = body.description.trim();
  if (typeof body.category === 'string') payload.category = body.category;
  if (typeof body.fromWalletId === 'string') payload.fromWalletId = body.fromWalletId;
  if (typeof body.toWalletId === 'string') payload.toWalletId = body.toWalletId;
  if (typeof body.date === 'string') payload.date = body.date;

  return proxyFinanceWrite('/finance/transactions', 'POST', payload);
}
