import { invalidIdResponse, isValidResourceId } from '@/app/api/_lib/params';
import { proxyNotificationWrite } from '@/app/api/notifications/_lib/proxy';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  if (!isValidResourceId(id)) return invalidIdResponse();
  return proxyNotificationWrite(
    `/notifications/${encodeURIComponent(id)}/archive`,
    'POST',
    {},
  );
}
