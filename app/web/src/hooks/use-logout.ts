'use client';

import { useCallback, useState } from 'react';
import { toastUpdated } from '@/lib/app-toast';
import { logout } from '@/services/auth';
import { CRUD_TOAST } from '@/utils/crud-toast-messages';

export function useLogout() {
  const [loading, setLoading] = useState(false);

  const runLogout = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      await logout();
      toastUpdated(CRUD_TOAST.loggedOut);
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
