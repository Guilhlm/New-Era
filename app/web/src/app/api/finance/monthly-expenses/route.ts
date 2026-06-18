import { NextResponse } from 'next/server';
import { proxyFinanceGet, proxyFinanceWrite } from '@/app/api/finance/_lib/proxy';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const month = url.searchParams.get('month');
  const limit = url.searchParams.get('limit');
  const params = new URLSearchParams();
  if (month) params.set('month', month);
  if (limit) params.set('limit', limit);
  const query = params.toString();
  return proxyFinanceGet(`/finance/monthly-expenses${query ? `?${query}` : ''}`);
}

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
  if (typeof body.categoryId === 'string') payload.categoryId = body.categoryId;
  if (typeof body.account === 'string') payload.account = body.account.trim();
  if (typeof body.date === 'string') payload.date = body.date;
  if (body.status === 'paid' || body.status === 'pending') payload.status = body.status;

  return proxyFinanceWrite('/finance/monthly-expenses', 'POST', payload);
}
