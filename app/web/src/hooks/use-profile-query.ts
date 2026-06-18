'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { HttpError } from '@/services/http';
import { queryKeys } from '@/lib/query-keys';
import { getProfile } from '@/services/profile';
import type { MeUser } from '@/types/profile';

/** Single shared `['me']` query: sidebar, profile page and forms all reuse it. */
export function useProfileQuery() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.me,
    queryFn: getProfile,
    retry: 3,
  });

  const reloadUser = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.me });
  }, [queryClient]);

  const setUser = useCallback(
    (user: MeUser | null) => {
      queryClient.setQueryData(queryKeys.me, user);
    },
    [queryClient],
  );

  const loadError = query.isError
    ? query.error instanceof HttpError && query.error.message
      ? query.error.message
      : 'Could not load profile.'
    : null;

  return {
    data: {
      user: query.data ?? null,
      loadError,
      loading: query.isPending,
    },
    actions: {
      reloadUser,
      setUser,
    },
  };
}
