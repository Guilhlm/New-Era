'use client';

import { useCallback, useEffect, useState } from 'react';
import { HttpError } from '@/services/http';
import { getProfile } from '@/services/profile';
import type { MeUser } from '@/types/profile';

export function useProfileQuery() {
  const [user, setUser] = useState<MeUser | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const reloadUser = useCallback(async () => {
    setLoadError(null);
    try {
      const nextUser = await getProfile();
      setUser(nextUser);
    } catch (error) {
      if (error instanceof HttpError && error.message) {
        setLoadError(error.message);
        return;
      }
      setLoadError('Could not load profile.');
    }
  }, []);

  useEffect(() => {
    void reloadUser();
  }, [reloadUser]);

  return {
    data: {
      user,
      loadError,
    },
    actions: {
      reloadUser,
      setUser,
    },
  };
}
