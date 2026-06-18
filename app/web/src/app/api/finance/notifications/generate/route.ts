import { proxyFinanceWrite } from '@/app/api/finance/_lib/proxy';

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const payload: Record<string, unknown> = {};
  if (typeof body.includeDaily === 'boolean') payload.includeDaily = body.includeDaily;
  if (typeof body.includeWeekly === 'boolean') payload.includeWeekly = body.includeWeekly;
  if (typeof body.includeMonthly === 'boolean') payload.includeMonthly = body.includeMonthly;
  if (typeof body.reason === 'string') payload.reason = body.reason;

  return proxyFinanceWrite('/finance/notifications/generate', 'POST', payload);
}
