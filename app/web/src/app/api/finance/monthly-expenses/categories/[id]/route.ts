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
  if (typeof body.name === 'string') payload.name = body.name.trim();
  if (typeof body.budget === 'number') payload.budget = body.budget;
  if (typeof body.spentAdjustment === 'number') payload.spentAdjustment = body.spentAdjustment;
  return proxyFinanceWrite(
    `/finance/monthly-expenses/categories/${encodeURIComponent(id)}`,
    'PATCH',
    payload,
  );
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  if (!isValidResourceId(id)) return invalidIdResponse();
  return proxyFinanceWrite(
    `/finance/monthly-expenses/categories/${encodeURIComponent(id)}`,
    'DELETE',
  );
}
