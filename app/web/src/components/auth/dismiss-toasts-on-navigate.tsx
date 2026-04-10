'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

/** Fecha todos os toasts ao mudar de rota (não no primeiro paint da página). */
export function DismissToastsOnNavigate() {
  const pathname = usePathname();
  const isFirstPathEffect = useRef(true);

  useEffect(() => {
    if (isFirstPathEffect.current) {
      isFirstPathEffect.current = false;
      return;
    }
    toast.dismiss();
  }, [pathname]);

  return null;
}
