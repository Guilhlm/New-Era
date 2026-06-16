'use client';

import { Toaster } from 'sonner';

import { APP_TOAST_DURATION_MS } from '@/lib/app-toast';

/** Toaster global: canto superior direito, sem fechar manual, barra de tempo na cor `red`. */
export function AuthToaster() {
  return (
    <Toaster
      className="auth-toaster"
      position="top-right"
      closeButton={false}
      duration={APP_TOAST_DURATION_MS}
      theme="dark"
      toastOptions={{
        classNames: {
          /* Não usar `relative`: o Sonner posiciona com `position: absolute`. */
          toast:
            'group w-[min(100%,22rem)] rounded-lg border border-red/40 bg-red/40 text-on-accent backdrop-blur-md elevated-shadow [&_[data-icon]]:!text-red [&_[data-title]]:!text-on-accent [&_[data-description]]:!text-on-accent/90',
          success:
            '!border-red/40 !bg-red/40 !text-on-accent [&_[data-icon]]:!text-red [&_[data-title]]:!text-on-accent [&_[data-description]]:!text-on-accent/90',
          error:
            '!border-red/40 !bg-red/40 !text-on-accent [&_[data-icon]]:!text-red [&_[data-title]]:!text-on-accent [&_[data-description]]:!text-on-accent/90',
          title: 'type-body-strong text-on-accent',
          description: 'type-body text-on-accent/90',
        },
      }}
    />
  );
}
