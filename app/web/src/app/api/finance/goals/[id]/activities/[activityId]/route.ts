import { invalidIdResponse, isValidResourceId } from '@/app/api/_lib/params';
import { proxyFinanceWrite } from '@/app/api/finance/_lib/proxy';

type RouteContext = { params: Promise<{ id: string; activityId: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  const { id, activityId } = await context.params;
  if (!isValidResourceId(id) || !isValidResourceId(activityId)) return invalidIdResponse();

  return proxyFinanceWrite(
    `/finance/goals/${encodeURIComponent(id)}/activities/${encodeURIComponent(activityId)}`,
    'DELETE',
  );
}
