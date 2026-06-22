'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import type {
  NotificationFilter,
  NotificationVm,
} from '@/components/notifications/notifications-types';
import { queryKeys } from '@/lib/query-keys';
import {
  archiveNotification,
  generateNotifications,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  snoozeNotification,
} from '@/services/notifications';
import { HttpError } from '@/services/http';

/** Aceita apenas caminhos internos ("/algo"), bloqueando URLs absolutas e protocol-relative. */
function toSafeInternalHref(href: string | null | undefined): string | undefined {
  if (!href || !href.startsWith('/') || href.startsWith('//')) return undefined;
  return href;
}

function toRelativeTimeLabel(isoDate: string) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return 'Now';
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return 'Now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

export function useNotificationsDashboardState() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const query = useQuery({
    queryKey: queryKeys.notifications(filter),
    queryFn: () => getNotifications({ unreadOnly: filter === 'unread', limit: 200 }),
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  });

  const generateMutation = useMutation({ mutationFn: () => generateNotifications() });
  const markReadMutation = useMutation({
    mutationFn: ({ id, read }: { id: string; read: boolean }) =>
      markNotificationRead(id, read),
  });
  const markAllMutation = useMutation({ mutationFn: () => markAllNotificationsRead() });
  const archiveMutation = useMutation({ mutationFn: (id: string) => archiveNotification(id) });
  const snoozeMutation = useMutation({
    mutationFn: ({ id, minutes }: { id: string; minutes: number }) =>
      snoozeNotification(id, minutes),
  });
  const [saving, setSaving] = useState(false);

  async function invalidateNotificationCaches() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.notificationsUnreadCount }),
    ]);
  }

  async function runMutation<T>(action: () => Promise<T>) {
    setSaving(true);
    try {
      const result = await action();
      await invalidateNotificationCaches();
      return result;
    } finally {
      setSaving(false);
    }
  }

  // Notifications are no longer generated as a side-effect of the GET request.
  // Generate once when the dashboard mounts, then refresh the cached lists.
  const didGenerateRef = useRef(false);
  useEffect(() => {
    if (didGenerateRef.current) return;
    didGenerateRef.current = true;
    void generateMutation.mutateAsync().then(() => invalidateNotificationCaches());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const items = useMemo<NotificationVm[]>(
    () =>
      (query.data?.items ?? []).map((item) => ({
        id: item.id,
        category: item.category,
        kind: item.kind,
        priority: item.priority,
        period: item.period,
        title: item.title,
        body: item.body,
        timeLabel: toRelativeTimeLabel(item.createdAt),
        createdAt: item.createdAt,
        read: item.read,
        href: toSafeInternalHref(item.href),
        ctaLabel: item.ctaLabel ?? undefined,
        metadata: item.metadata ?? null,
      })),
    [query.data?.items],
  );

  return {
    data: {
      filter,
      items,
      unreadCount: query.data?.unreadCount ?? 0,
    },
    actions: {
      setFilter,
      toggleRead: (id: string, read: boolean) =>
        runMutation(() => markReadMutation.mutateAsync({ id, read })),
      markAllRead: () => runMutation(() => markAllMutation.mutateAsync()),
      archive: (id: string) => runMutation(() => archiveMutation.mutateAsync(id)),
      snooze: (id: string, minutes = 60) =>
        runMutation(() => snoozeMutation.mutateAsync({ id, minutes })),
      refreshGenerated: () => runMutation(() => generateMutation.mutateAsync()),
    },
    ui: {
      loading: query.isPending,
      saving,
      error:
        query.error instanceof HttpError
          ? query.error.message
          : query.error
            ? 'Failed to load notifications.'
            : null,
    },
  };
}
