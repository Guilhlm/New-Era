'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/components/ui/cn';

export const NATIVE_DIALOG_CLASS =
  'fixed inset-0 z-50 m-auto w-[min(92vw,24rem)] rounded-xl border border-layer2-half bg-layer1 p-0 text-text backdrop:bg-black/60';

type NativeDialogProps = {
  open: boolean;
  onClose: () => void;
  className?: string;
  children: ReactNode;
};

export function NativeDialog({ open, onClose, className, children }: NativeDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog ref={dialogRef} className={cn(NATIVE_DIALOG_CLASS, className)} onClose={onClose}>
      {children}
    </dialog>
  );
}
