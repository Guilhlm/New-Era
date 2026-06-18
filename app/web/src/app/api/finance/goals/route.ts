import { NextResponse } from 'next/server';
import { proxyFinanceGet, proxyFinanceWrite } from '@/app/api/finance/_lib/proxy';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sort = url.searchParams.get('sort');
  return proxyFinanceGet(
    `/finance/goals${sort ? `?sort=${encodeURIComponent(sort)}` : ''}`,
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
  if (typeof body.title === 'string') payload.title = body.title.trim();
  if (typeof body.description === 'string') payload.description = body.description.trim();
  if (typeof body.targetAmount === 'number') payload.targetAmount = body.targetAmount;
  if (typeof body.currentAmount === 'number') payload.currentAmount = body.currentAmount;
  if (typeof body.deadline === 'string') payload.deadline = body.deadline;

  return proxyFinanceWrite('/finance/goals', 'POST', payload);
}
