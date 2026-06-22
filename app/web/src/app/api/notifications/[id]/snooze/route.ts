import { invalidIdResponse, isValidResourceId } from '@/app/api/_lib/params';
import { proxyNotificationWrite } from '@/app/api/notifications/_lib/proxy';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  if (!isValidResourceId(id)) return invalidIdResponse();

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const payload: Record<string, unknown> = {};
  if (typeof body.minutes === 'number') payload.minutes = body.minutes;
  return proxyNotificationWrite(
    `/notifications/${encodeURIComponent(id)}/snooze`,
    'POST',
    payload,
  );
}
