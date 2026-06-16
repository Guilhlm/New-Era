import { NextResponse } from 'next/server';

import { invalidIdResponse, isValidResourceId } from '@/app/api/_lib/params';
import { proxyFinanceWrite } from '@/app/api/finance/_lib/proxy';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  if (!isValidResourceId(id)) return invalidIdResponse();

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const payload: Record<string, unknown> = {};
  if (typeof body.action === 'string') payload.action = body.action;
  if (typeof body.shares === 'number') payload.shares = body.shares;
  if (typeof body.price === 'number') payload.price = body.price;

  return proxyFinanceWrite(`/finance/investments/${encodeURIComponent(id)}/trade`, 'POST', payload);
}
