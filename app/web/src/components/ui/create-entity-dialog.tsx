'use client';

import type { ReactNode } from 'react';
import { NativeDialog } from '@/components/ui/native-dialog';

type CreateEntityDialogProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  formKey?: string;
};

export function CreateEntityDialog({ open, onClose, children, formKey = 'create-entity' }: CreateEntityDialogProps) {
  return (
    <NativeDialog open={open} onClose={onClose}>
      {open ? <div key={formKey}>{children}</div> : null}
    </NativeDialog>
  );
}
