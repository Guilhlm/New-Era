import { proxyNotificationGet } from '@/app/api/notifications/_lib/proxy';

export async function GET() {
  return proxyNotificationGet('/notifications/unread-count');
}
