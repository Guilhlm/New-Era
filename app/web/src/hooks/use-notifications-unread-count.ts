'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getNotificationsUnreadCount } from '@/services/notifications';

export function useNotificationsUnreadCount(enabled = true) {
  return useQuery({
    queryKey: queryKeys.notificationsUnreadCount,
    queryFn: async () => {
      const response = await getNotificationsUnreadCount();
      return response.unreadCount;
    },
    enabled,
    staleTime: 60_000,
    refetchInterval: enabled ? 60_000 : false,
    refetchIntervalInBackground: false,
  });
}
