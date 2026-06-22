import { NextResponse } from 'next/server';

import { invalidIdResponse, isValidResourceId } from '@/app/api/_lib/params';
import { proxyFinanceGet, proxyFinanceWrite } from '@/app/api/finance/_lib/proxy';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  if (!isValidResourceId(id)) return invalidIdResponse();
  return proxyFinanceGet(`/finance/investments/${encodeURIComponent(id)}`);
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
  if (typeof body.ticker === 'string') payload.ticker = body.ticker.trim();
  if (typeof body.name === 'string') payload.name = body.name.trim();
  if (typeof body.type === 'string') payload.type = body.type;
  if (typeof body.notes === 'string') payload.notes = body.notes;

  return proxyFinanceWrite(`/finance/investments/${encodeURIComponent(id)}`, 'PATCH', payload);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  if (!isValidResourceId(id)) return invalidIdResponse();
  return proxyFinanceWrite(`/finance/investments/${encodeURIComponent(id)}`, 'DELETE');
}
