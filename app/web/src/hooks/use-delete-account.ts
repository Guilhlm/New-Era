'use client';

import { useCallback, useState } from 'react';
import { toastAuthError } from '@/lib/app-toast';
import { deleteProfile } from '@/services/profile';
import { HttpError } from '@/services/http';

export function useDeleteAccount() {
  const [deleting, setDeleting] = useState(false);

  const runDeleteAccount = useCallback(async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await deleteProfile();
      window.location.href = '/login';
    } catch (error) {
      const message =
        error instanceof HttpError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Could not delete account.';
      toastAuthError(message);
      setDeleting(false);
    }
  }, [deleting]);

  return {
    data: { deleting },
    actions: { runDeleteAccount },
  };
}
