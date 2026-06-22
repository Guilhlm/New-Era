import { proxyAuthedGet, proxyAuthedWrite } from '@/app/api/_lib/upstream-proxy';

export async function proxyNotificationGet(path: string) {
  return proxyAuthedGet(path, 'Notification request failed');
}

export async function proxyNotificationWrite(
  path: string,
  method: 'POST' | 'PATCH' | 'DELETE',
  body?: Record<string, unknown>,
) {
  return proxyAuthedWrite(path, method, body, 'Notification request failed');
}
