'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/cn';
import { NativeDialog } from '@/components/ui/native-dialog';
import {
  walletDialogFieldClass,
  walletDialogSelectClass,
} from '@/components/wallet/wallet-dialog-layout';
import { typeClass, typeToneClass } from '@/lib/typography';
import { DIET_WEEKDAYS } from '@/utils/diet-constants';

type DietCopyDayDialogProps = {
  open: boolean;
  sourceWeekday: number;
  sourceWeekdayLabel: string;
  saving?: boolean;
  onClose: () => void;
  onCopy: (targetWeekday: number | 'all') => void;
};

export function DietCopyDayDialog({
  open,
  sourceWeekday,
  sourceWeekdayLabel,
  saving = false,
  onClose,
  onCopy,
}: DietCopyDayDialogProps) {
  const firstTarget = DIET_WEEKDAYS.find((day) => day.index !== sourceWeekday)?.index ?? 0;
  const [target, setTarget] = useState<number | 'all'>(firstTarget);

  useEffect(() => {
    if (open) setTarget(firstTarget);
  }, [open, firstTarget]);

  return (
    <NativeDialog open={open} onClose={onClose}>
      <form
        method="dialog"
        className="flex flex-col gap-4 p-5"
        onSubmit={(event) => {
          event.preventDefault();
          if (target !== sourceWeekday) onCopy(target);
        }}
      >
        <div>
          <p className={cn(typeClass.title, typeToneClass.default)}>Copy diet day</p>
          <p className={cn('mt-2', typeClass.body, typeToneClass.muted60)}>
            Copy every meal from {sourceWeekdayLabel} to another day or all days. Target days&apos;
            current meals will be replaced.
          </p>
        </div>

        <label className={walletDialogFieldClass}>
          <span className={cn(typeClass.caption, typeToneClass.muted60)}>Copy to</span>
          <select
            value={target}
            disabled={saving}
            className={cn('w-full disabled:opacity-60', walletDialogSelectClass, typeClass.body, typeToneClass.default)}
            onChange={(event) => {
              const value = event.target.value;
              setTarget(value === 'all' ? 'all' : Number(value));
            }}
          >
            <option value="all">All days</option>
            {DIET_WEEKDAYS.filter((day) => day.index !== sourceWeekday).map((day) => (
              <option key={day.index} value={day.index}>
                {day.label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex gap-2">
          <Button type="submit" variant="primary" size="sm" disabled={saving} className="flex-1">
            Copy day
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={saving}
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </form>
    </NativeDialog>
  );
}
