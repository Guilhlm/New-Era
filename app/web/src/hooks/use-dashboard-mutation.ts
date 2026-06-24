'use client';

import { useCallback, useState } from 'react';
import { toastAuthError, toastUpdated } from '@/lib/app-toast';
import { HttpError } from '@/services/http';

export type DashboardMutationResult<T> = T | { error: string };

type UseDashboardMutationOptions = {
  onSuccess?: () => Promise<void> | void;
};

export function useDashboardMutation({ onSuccess }: UseDashboardMutationOptions = {}) {
  const [pendingKeys, setPendingKeys] = useState<Set<string>>(() => new Set());

  const isPending = useCallback(
    (key?: string) => (key ? pendingKeys.has(key) : pendingKeys.size > 0),
    [pendingKeys],
  );

  const run = useCallback(
    async <T>(
      key: string,
      action: () => Promise<T>,
      successMessage: string,
    ): Promise<DashboardMutationResult<T>> => {
      setPendingKeys((prev) => new Set(prev).add(key));
      try {
        const result = await action();
        await onSuccess?.();
        toastUpdated(successMessage);
        return result;
      } catch (error) {
        const message = error instanceof HttpError ? error.message : 'Request failed.';
        toastAuthError(message);
        return { error: message };
      } finally {
        setPendingKeys((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }
    },
    [onSuccess],
  );

  return {
    run,
    isPending,
    saving: pendingKeys.size > 0,
  };
}

export function isMutationError<T>(
  result: DashboardMutationResult<T>,
): result is { error: string } {
  return typeof result === 'object' && result !== null && 'error' in result;
}
