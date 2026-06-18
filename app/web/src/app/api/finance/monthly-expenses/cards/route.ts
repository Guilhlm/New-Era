import { NextResponse } from 'next/server';
import { proxyFinanceGet, proxyFinanceWrite } from '@/app/api/finance/_lib/proxy';

export async function GET() {
  return proxyFinanceGet('/finance/monthly-expenses/cards');
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const payload: Record<string, unknown> = {};
  if (typeof body.holderName === 'string') payload.holderName = body.holderName.trim();
  if (typeof body.lastFour === 'string') payload.lastFour = body.lastFour;
  if (typeof body.brand === 'string') payload.brand = body.brand;
  if (typeof body.color === 'string') payload.color = body.color;
  if (typeof body.limitTotal === 'number') payload.limitTotal = body.limitTotal;
  if (typeof body.limitUsage === 'number') payload.limitUsage = body.limitUsage;
  if (typeof body.type === 'string') payload.type = body.type;

  return proxyFinanceWrite('/finance/monthly-expenses/cards', 'POST', payload);
}
