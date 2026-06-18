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
  if (typeof body.description === 'string') payload.description = body.description.trim();
  if (typeof body.targetAmount === 'number') payload.targetAmount = body.targetAmount;
  if (typeof body.currentAmount === 'number') payload.currentAmount = body.currentAmount;
  if (typeof body.deadline === 'string') payload.deadline = body.deadline;

  return proxyFinanceWrite(`/finance/goals/${encodeURIComponent(id)}`, 'PATCH', payload);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  if (!isValidResourceId(id)) return invalidIdResponse();
  return proxyFinanceWrite(`/finance/goals/${encodeURIComponent(id)}`, 'DELETE');
}
