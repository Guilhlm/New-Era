import { invalidIdResponse, isValidResourceId } from '@/app/api/_lib/params';
import { proxyFinanceWrite } from '@/app/api/finance/_lib/proxy';

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  if (!isValidResourceId(id)) return invalidIdResponse();
  return proxyFinanceWrite(
    `/finance/monthly-expenses/card-purchases/${encodeURIComponent(id)}`,
    'DELETE',
  );
}
