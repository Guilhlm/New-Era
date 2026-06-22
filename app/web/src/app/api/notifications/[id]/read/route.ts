import { invalidIdResponse, isValidResourceId } from '@/app/api/_lib/params';
import { proxyNotificationWrite } from '@/app/api/notifications/_lib/proxy';

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  if (!isValidResourceId(id)) return invalidIdResponse();

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const payload: Record<string, unknown> = {};
  if (typeof body.read === 'boolean') payload.read = body.read;
  return proxyNotificationWrite(
    `/notifications/${encodeURIComponent(id)}/read`,
    'PATCH',
    payload,
  );
}
