'use client';

import type { ReactNode } from 'react';
import { NativeDialog, NATIVE_DIALOG_SIZES } from '@/components/ui/native-dialog';

type CreateEntityDialogProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  formKey?: string;
  size?: keyof typeof NATIVE_DIALOG_SIZES;
};

export function CreateEntityDialog({
  open,
  onClose,
  children,
  formKey = 'create-entity',
  size = 'default',
}: CreateEntityDialogProps) {
  return (
    <NativeDialog open={open} onClose={onClose} size={size}>
      {open ? <div key={formKey}>{children}</div> : null}
    </NativeDialog>
  );
}
