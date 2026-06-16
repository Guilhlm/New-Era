import { NextResponse } from 'next/server';

import { invalidIdResponse, isValidResourceId } from '@/app/api/_lib/params';
import { proxyFinanceGet, proxyFinanceWrite } from '@/app/api/finance/_lib/proxy';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  if (!isValidResourceId(id)) return invalidIdResponse();
  return proxyFinanceGet(`/finance/transactions/${encodeURIComponent(id)}`);
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  if (!isValidResourceId(id)) return invalidIdResponse();

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

  return proxyFinanceWrite(`/finance/transactions/${encodeURIComponent(id)}`, 'PATCH', payload);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  if (!isValidResourceId(id)) return invalidIdResponse();
  return proxyFinanceWrite(`/finance/transactions/${encodeURIComponent(id)}`, 'DELETE');
}
