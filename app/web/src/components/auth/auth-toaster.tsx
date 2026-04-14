'use client';

import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';

import { AUTH_TOAST_DURATION_MS } from '@/components/auth/auth-toast-constants';

/** Toaster global: canto superior direito, sem fechar manual, barra de tempo na cor `red`. */
export function AuthToaster() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Toaster
      className="auth-toaster"
      position="top-right"
      closeButton={false}
      duration={AUTH_TOAST_DURATION_MS}
      toastOptions={{
        classNames: {
          /* Não usar `relative`: o Sonner posiciona com `position: absolute`. */
          toast:
            'group w-[min(100%,22rem)] rounded-lg border border-grey bg-layer2 text-text shadow-[0_8px_32px_rgba(0,0,0,0.5)]',
          error:
            '!border-red !bg-red/25 !text-text [&_[data-icon]]:!text-red [&_[data-title]]:!text-text [&_[data-description]]:!text-text/85',
          success:
            '!border-grey !bg-layer2 !text-text [&_[data-icon]]:!text-red [&_[data-title]]:!text-text [&_[data-description]]:!text-text/85',
          title: 'text-sm font-semibold',
          description: 'text-sm font-normal text-text/85',
        },
      }}
    />
  );
}
