import { NextResponse } from 'next/server';
import { proxyFinanceGet, proxyFinanceWrite } from '@/app/api/finance/_lib/proxy';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const month = url.searchParams.get('month');
  return proxyFinanceGet(
    `/finance/monthly-expenses/categories${month ? `?month=${encodeURIComponent(month)}` : ''}`,
  );
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
  if (typeof body.budget === 'number') payload.budget = body.budget;
  return proxyFinanceWrite('/finance/monthly-expenses/categories', 'POST', payload);
}
