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
  if (typeof body.monthKey === 'string') payload.monthKey = body.monthKey;
  if (typeof body.amount === 'number') payload.amount = body.amount;

  return proxyFinanceWrite(
    `/finance/monthly-expenses/invoices/${encodeURIComponent(id)}/pay`,
    'POST',
    payload,
  );
}
