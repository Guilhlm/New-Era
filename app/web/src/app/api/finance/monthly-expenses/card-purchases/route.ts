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
  if (typeof body.title === 'string') payload.title = body.title.trim();
  if (typeof body.amount === 'number') payload.amount = body.amount;
  if (typeof body.cardId === 'string') payload.cardId = body.cardId;
  if (typeof body.categoryId === 'string') payload.categoryId = body.categoryId;
  if (typeof body.date === 'string') payload.date = body.date;
  if (typeof body.installments === 'number') payload.installments = body.installments;

  return proxyFinanceWrite('/finance/monthly-expenses/card-purchases', 'POST', payload);
}
