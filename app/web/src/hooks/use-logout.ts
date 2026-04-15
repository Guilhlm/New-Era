'use client';

import { useCallback, useState } from 'react';
import { logout } from '@/services/auth';

export function useLogout() {
  const [loading, setLoading] = useState(false);

  const runLogout = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      await logout();
    } finally {
      window.location.href = '/login';
    }
  }, [loading]);

  return {
    data: {
      loading,
    },
    actions: {
      runLogout,
    },
  };
}
