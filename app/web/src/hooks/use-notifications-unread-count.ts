'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getNotifications } from '@/services/finance';

export function useNotificationsUnreadCount() {
  return useQuery({
    queryKey: queryKeys.notificationsUnreadCount,
    queryFn: async () => {
      const response = await getNotifications({ limit: 1 });
      return response.unreadCount;
    },
    staleTime: 10_000,
    refetchInterval: 30_000,
  });
}
