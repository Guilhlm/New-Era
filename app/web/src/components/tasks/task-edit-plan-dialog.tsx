'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';
import { NativeDialog } from '@/components/ui/native-dialog';

type TaskEditPlanDialogProps = {
  open: boolean;
  weekdayLabel: string;
  saving?: boolean;
  onClose: () => void;
  onSave: (title: string, scheduledAt: string) => void;
};

export function TaskEditPlanDialog({
  open,
  weekdayLabel,
  saving = false,
  onClose,
  onSave,
}: TaskEditPlanDialogProps) {
  const [title, setTitle] = useState('');
  const [scheduledAt, setScheduledAt] = useState('09:00');

  useEffect(() => {
    if (open) {
      setTitle('');
      setScheduledAt('09:00');
    }
  }, [open]);

  return (
    <NativeDialog open={open} onClose={onClose}>
      {open ? (
        <form
          method="dialog"
          className="flex flex-col gap-4 p-5"
          onSubmit={(event) => {
            event.preventDefault();
            const trimmed = title.trim();
            if (trimmed && scheduledAt) onSave(trimmed, scheduledAt);
          }}
        >
          <div>
            <p className={cn(typeClass.title, typeToneClass.default)}>Edit plan</p>
            <p className={cn('mt-1', typeClass.body, typeToneClass.muted60)}>{weekdayLabel}</p>
          </div>

          <input
            type="text"
            autoFocus
            disabled={saving}
            value={title}
            placeholder="Workout, meal prep…"
            className="rounded-md bg-layer2 px-3 py-2 text-text outline-none placeholder:text-text/40 focus-visible:ring-2 focus-visible:ring-red/60"
            onChange={(event) => setTitle(event.target.value)}
          />

          <label className={cn('flex flex-col gap-2', typeClass.body)}>
            <span className="text-text/60">Time</span>
            <input
              type="time"
              disabled={saving}
              value={scheduledAt}
              className="rounded-md bg-layer2 px-3 py-2 text-text outline-none focus-visible:ring-2 focus-visible:ring-red/60"
              onChange={(event) => setScheduledAt(event.target.value)}
            />
          </label>

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
