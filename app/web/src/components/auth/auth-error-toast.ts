'use client';

import { toast } from 'sonner';

import { AUTH_TOAST_DURATION_MS } from '@/components/auth/auth-toast-constants';

/** Mesmo id = uma notificação de cada vez; nova mensagem substitui a anterior. */
const AUTH_ERROR_TOAST_ID = 'auth-error';

export function toastAuthError(message: string) {
  toast.error(message, {
    id: AUTH_ERROR_TOAST_ID,
    duration: AUTH_TOAST_DURATION_MS,
  });
}
