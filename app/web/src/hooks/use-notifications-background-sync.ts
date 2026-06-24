'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { queryKeys } from '@/lib/query-keys';
import { generateNotifications } from '@/services/notifications';

const GENERATE_INTERVAL_MS = 45_000;

/** Keeps notification rules running while the user is logged in (any main route). */
export function useNotificationsBackgroundSync() {
  const queryClient = useQueryClient();
  const generateMutation = useMutation({ mutationFn: () => generateNotifications() });
  const runningRef = useRef(false);

  useEffect(() => {
    async function tick() {
      if (runningRef.current) return;
      runningRef.current = true;
      try {
        await generateMutation.mutateAsync();
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: queryKeys.notificationsUnreadCount }),
          queryClient.invalidateQueries({ queryKey: queryKeys.notifications() }),
        ]);
      } catch {
        // Offline / session expired — next interval retries.
      } finally {
        runningRef.current = false;
      }
    }

    void tick();

    const intervalId = window.setInterval(() => {
      void tick();
    }, GENERATE_INTERVAL_MS);

    const onFocus = () => {
      void tick();
    };
    window.addEventListener('focus', onFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
    };
  }, [generateMutation, queryClient]);
}
