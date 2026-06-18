import { NextResponse } from 'next/server';
import { invalidIdResponse, isValidResourceId } from '@/app/api/_lib/params';
import { proxyFinanceWrite } from '@/app/api/finance/_lib/proxy';

type RouteContext = { params: Promise<{ id: string }> };

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
  if (typeof body.title === 'string') payload.title = body.title.trim();
  if (typeof body.amount === 'number') payload.amount = body.amount;
  if (typeof body.categoryId === 'string') payload.categoryId = body.categoryId;
  if (typeof body.account === 'string') payload.account = body.account.trim();
  if (typeof body.date === 'string') payload.date = body.date;
  if (body.status === 'paid' || body.status === 'pending') payload.status = body.status;

  return proxyFinanceWrite(
    `/finance/monthly-expenses/${encodeURIComponent(id)}`,
    'PATCH',
    payload,
  );
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  if (!isValidResourceId(id)) return invalidIdResponse();
  return proxyFinanceWrite(`/finance/monthly-expenses/${encodeURIComponent(id)}`, 'DELETE');
}
