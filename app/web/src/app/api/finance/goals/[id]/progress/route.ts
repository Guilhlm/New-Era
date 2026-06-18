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
  if (typeof body.amount === 'number') payload.amount = body.amount;
  if (body.mode === 'set' || body.mode === 'add') payload.mode = body.mode;
  if (typeof body.label === 'string') payload.label = body.label.trim();
  return proxyFinanceWrite(
    `/finance/goals/${encodeURIComponent(id)}/progress`,
    'PATCH',
    payload,
  );
}
