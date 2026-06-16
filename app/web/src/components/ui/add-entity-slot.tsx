'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';
import { MdAdd } from 'react-icons/md';

type AddEntitySlotProps = {
  label: string;
  onAdd: () => void;
  className?: string;
};

export function AddEntitySlot({ label, onAdd, className }: AddEntitySlotProps) {
  return (
    <Card
      className={cn(
        'flex min-h-[72px] flex-col items-center justify-center border border-dashed border-text/15 bg-layer1/40 px-6 py-4 transition-colors hover:border-text/25 hover:bg-layer2-half/30',
        className,
      )}
    >
      <button
        type="button"
        onClick={onAdd}
        className="flex flex-col items-center gap-2 text-text/50 transition-colors hover:text-text/70"
      >
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-layer2-half">
          <MdAdd className="h-6 w-6" aria-hidden />
        </span>
        <span className={cn(typeClass.bodyStrong, typeToneClass.muted)}>{label}</span>
      </button>
    </Card>
  );
}
