'use client';

import { toast } from 'sonner';

/** Manter alinhado com `--auth-toast-duration` em `globals.css` (ms). */
export const APP_TOAST_DURATION_MS = 5000;

/** Mesmo id = uma notificação de cada vez; nova mensagem substitui a anterior. */
const APP_TOAST_ID = 'app-toast';

export function toastAuthError(message: string) {
  toast.error(message, {
    id: APP_TOAST_ID,
    duration: APP_TOAST_DURATION_MS,
  });
}

/** Sucesso de update/save CRUD — mesmo visual do perfil (`Profile updated.`). */
export function toastUpdated(message: string) {
  toast.error(message, {
    id: APP_TOAST_ID,
    duration: APP_TOAST_DURATION_MS,
  });
}
