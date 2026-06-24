'use client';

import { useState } from 'react';
import { TbTrash } from 'react-icons/tb';
import { Button } from '@/components/ui/button';
import { NativeDialog } from '@/components/ui/native-dialog';
import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';

type ProfileDeleteAccountDialogProps = {
  open: boolean;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function ProfileDeleteAccountDialog({
  open,
  deleting,
  onClose,
  onConfirm,
}: ProfileDeleteAccountDialogProps) {
  return (
    <NativeDialog open={open} onClose={deleting ? () => undefined : onClose}>
      <div className="flex flex-col gap-4 p-5">
        <div>
          <p className={cn(typeClass.title, typeToneClass.default)}>Delete account</p>
          <p className={cn('mt-2', typeClass.body, typeToneClass.muted60)}>
            This action is permanent. Your account and all associated data will be deleted and
            cannot be recovered.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="flex-1"
            disabled={deleting}
            onClick={onConfirm}
          >
            {deleting ? 'Deleting…' : 'Delete account'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="flex-1"
            disabled={deleting}
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </div>
    </NativeDialog>
  );
}

type ProfileDeleteAccountButtonProps = {
  deleting: boolean;
  onConfirm: () => void;
};

export function ProfileDeleteAccountButton({
  deleting,
  onConfirm,
}: ProfileDeleteAccountButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="ghostIcon"
        size="icon"
        radius="md"
        aria-label="Delete account"
        disabled={deleting}
        className="h-12 w-12 shrink-0 bg-layer2"
        onClick={() => setOpen(true)}
      >
        <TbTrash className="h-5 w-5" aria-hidden />
      </Button>
      <ProfileDeleteAccountDialog
        open={open}
        deleting={deleting}
        onClose={() => setOpen(false)}
        onConfirm={() => {
          onConfirm();
        }}
      />
    </>
  );
}
