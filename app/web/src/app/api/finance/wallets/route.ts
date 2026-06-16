import { NextResponse } from 'next/server';

import { proxyFinanceGet, proxyFinanceWrite } from '@/app/api/finance/_lib/proxy';

export async function GET() {
  return proxyFinanceGet('/finance/wallet');
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const payload: Record<string, unknown> = {};
  if (typeof body.name === 'string') payload.name = body.name.trim();
  if (typeof body.type === 'string') payload.type = body.type;
  if (typeof body.balance === 'number') payload.balance = body.balance;

  return proxyFinanceWrite('/finance/wallet', 'POST', payload);
}
