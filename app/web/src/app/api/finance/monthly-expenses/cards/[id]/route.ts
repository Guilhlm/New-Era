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
  if (typeof body.holderName === 'string') payload.holderName = body.holderName.trim();
  if (typeof body.lastFour === 'string') payload.lastFour = body.lastFour;
  if (typeof body.brand === 'string') payload.brand = body.brand;
  if (typeof body.color === 'string') payload.color = body.color;
  if (typeof body.limitTotal === 'number') payload.limitTotal = body.limitTotal;
  if (typeof body.limitUsage === 'number') payload.limitUsage = body.limitUsage;
  if (typeof body.type === 'string') payload.type = body.type;
  if (typeof body.dueDay === 'number') payload.dueDay = body.dueDay;

  return proxyFinanceWrite(
    `/finance/monthly-expenses/cards/${encodeURIComponent(id)}`,
    'PATCH',
    payload,
  );
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  if (!isValidResourceId(id)) return invalidIdResponse();
  return proxyFinanceWrite(
    `/finance/monthly-expenses/cards/${encodeURIComponent(id)}`,
    'DELETE',
  );
}
