import type { NotificationsResponseRecord } from '@/types/notifications';
import { getJson, patchJson, postJson } from '@/services/http';

export type NotificationListOptions = {
  period?: 'daily' | 'weekly' | 'monthly';
  kind?: 'alert' | 'reminder' | 'insight' | 'update';
  category?:
    | 'tasks'
    | 'finance'
    | 'goals'
    | 'wallet'
    | 'diet'
    | 'training'
    | 'body'
    | 'system';
  priority?: 'urgent' | 'normal' | 'low';
  unreadOnly?: boolean;
  limit?: number;
};

export function getNotifications(options?: NotificationListOptions) {
  const params = new URLSearchParams();
  if (options?.period) params.set('period', options.period);
  if (options?.kind) params.set('kind', options.kind);
  if (options?.category) params.set('category', options.category);
  if (options?.priority) params.set('priority', options.priority);
  if (options?.unreadOnly) params.set('unreadOnly', 'true');
  if (typeof options?.limit === 'number') params.set('limit', String(options.limit));
  const query = params.toString();
  return getJson<NotificationsResponseRecord>(
    `/api/notifications${query ? `?${query}` : ''}`,
    {
      cache: 'no-store',
      credentials: 'include',
    },
  );
}

export function getNotificationsUnreadCount() {
  return getJson<{ unreadCount: number }>('/api/notifications/unread-count', {
    cache: 'no-store',
    credentials: 'include',
  });
}

export function generateNotifications() {
  return postJson<{ ok: true }, Record<string, never>>('/api/notifications/generate', {}, {
    cache: 'no-store',
    credentials: 'include',
  });
}

export function markNotificationRead(id: string, read = true) {
  return patchJson<{ ok: true }, { read: boolean }>(
    `/api/notifications/${id}/read`,
    { read },
    {
      cache: 'no-store',
      credentials: 'include',
    },
  );
}

export function markAllNotificationsRead() {
  return postJson<{ ok: true }, Record<string, never>>(
    '/api/notifications/read-all',
    {},
    {
      cache: 'no-store',
      credentials: 'include',
    },
  );
}

export function archiveNotification(id: string) {
  return postJson<{ ok: boolean }, Record<string, never>>(
    `/api/notifications/${id}/archive`,
    {},
    {
      cache: 'no-store',
      credentials: 'include',
    },
  );
}

export function snoozeNotification(id: string, minutes = 60) {
  return postJson<{ ok: boolean }, { minutes: number }>(
    `/api/notifications/${id}/snooze`,
    { minutes },
    {
      cache: 'no-store',
      credentials: 'include',
    },
  );
}
