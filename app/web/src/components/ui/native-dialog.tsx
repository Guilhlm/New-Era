'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/components/ui/cn';

export const NATIVE_DIALOG_BASE =
  'fixed inset-0 z-50 m-auto rounded-xl border border-layer2-half bg-layer1 p-0 text-text backdrop:bg-backdrop';

export const NATIVE_DIALOG_SIZES = {
  default: 'w-[min(92vw,24rem)]',
  wide: 'w-[min(94vw,30rem)] max-h-[min(90dvh,680px)] overflow-y-auto shadow-2xl',
} as const;

export const NATIVE_DIALOG_CLASS = `${NATIVE_DIALOG_BASE} ${NATIVE_DIALOG_SIZES.default}`;

type NativeDialogProps = {
  open: boolean;
  onClose: () => void;
  className?: string;
  children: ReactNode;
  /** Id of the element (usually the dialog heading) that titles this dialog. */
  ariaLabelledBy?: string;
  size?: keyof typeof NATIVE_DIALOG_SIZES;
};

export function NativeDialog({
  open,
  onClose,
  className,
  children,
  ariaLabelledBy,
  size = 'default',
}: NativeDialogProps) {
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
    <dialog
      ref={dialogRef}
      className={cn(NATIVE_DIALOG_BASE, NATIVE_DIALOG_SIZES[size], className)}
      onClose={onClose}
      aria-labelledby={ariaLabelledBy}
    >
      {children}
    </dialog>
  );
}
