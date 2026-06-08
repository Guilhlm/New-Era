'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/cn';
import { NativeDialog } from '@/components/ui/native-dialog';

type TrainingEditPlanDialogProps = {
  open: boolean;
  weekdayLabel: string;
  initialTitle: string;
  saving?: boolean;
  onClose: () => void;
  onSave: (title: string) => void;
};

export function TrainingEditPlanDialog({
  open,
  weekdayLabel,
  initialTitle,
  saving = false,
  onClose,
  onSave,
}: TrainingEditPlanDialogProps) {
  const [title, setTitle] = useState(initialTitle);

  useEffect(() => {
    if (open) setTitle(initialTitle);
  }, [open, initialTitle]);

  return (
    <NativeDialog open={open} onClose={onClose}>
      {open ? (
        <form
          method="dialog"
          className="flex flex-col gap-4 p-5"
          onSubmit={(event) => {
            event.preventDefault();
            const trimmed = title.trim();
            if (trimmed) onSave(trimmed);
          }}
        >
          <div>
            <p className="text-lg font-semibold text-text">Edit plan</p>
            <p className="mt-1 text-sm text-text/60">{weekdayLabel}</p>
          </div>

          <input
            type="text"
            autoFocus
            disabled={saving}
            value={title}
            placeholder="Chest | Triceps"
            className="rounded-md bg-layer2 px-3 py-2 text-text outline-none placeholder:text-text/40 focus-visible:ring-2 focus-visible:ring-red/60"
            onChange={(event) => setTitle(event.target.value)}
          />

          <div className="flex items-center gap-2">
            <Button type="submit" variant="primary" size="sm" disabled={saving || !title.trim()} className="flex-1">
              {saving ? 'Saving…' : 'Save plan'}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={saving}
              className={cn('bg-layer2 text-text hover:bg-layer2-half')}
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : null}
    </NativeDialog>
  );
}
