import { proxyNotificationWrite } from '@/app/api/notifications/_lib/proxy';

export async function POST() {
  return proxyNotificationWrite('/notifications/read-all', 'POST', {});
}
