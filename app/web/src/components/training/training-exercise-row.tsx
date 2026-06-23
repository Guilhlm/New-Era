'use client';

import Image from 'next/image';
import { memo } from 'react';
import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';
import type { TrainingExerciseVm } from '@/types/training';
import {
  formatExerciseDisplayName,
  formatRepsLabel,
  formatSeriesLabel,
  formatWeightLabel,
} from '@/utils/training-mapper';
import { MdSettings } from 'react-icons/md';
import { TbBarbell } from 'react-icons/tb';
import type { DraggableAttributes } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';

type TrainingExerciseRowProps = {
  data: TrainingExerciseVm;
  actions: {
    onSettings: () => void;
  };
  ui?: {
    disabled?: boolean;
  };
  readOnly?: boolean;
  dragHandle?: {
    attributes: DraggableAttributes;
    listeners: SyntheticListenerMap | undefined;
  };
};

export const TrainingExerciseRow = memo(function TrainingExerciseRow({
  data,
  actions,
  ui,
  readOnly = false,
  dragHandle,
}: TrainingExerciseRowProps) {
  const showStatsInline = readOnly;

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl bg-layer2-half px-4 py-3',
        !readOnly && dragHandle && 'cursor-grab touch-none active:cursor-grabbing',
      )}
      {...(!readOnly && dragHandle ? { ...dragHandle.attributes, ...dragHandle.listeners } : {})}
    >
      <div className="relative flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-layer2">
        {data.imageUrl ? (
          readOnly ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.imageUrl}
              alt=""
              className="h-full w-full object-cover grayscale"
              aria-hidden
            />
          ) : (
            <Image
              src={data.imageUrl}
              alt=""
              fill
              className="object-cover grayscale"
              aria-hidden
            />
          )
        ) : (
          <TbBarbell className="h-7 w-7 text-text/35" aria-hidden />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'truncate',
            typeClass.bodyStrong,
            typeToneClass.default,
            data.isCompleted && 'text-text/50 line-through',
          )}
        >
          {formatExerciseDisplayName(data.name, data.equipment)}
        </p>
        {!showStatsInline ? (
          <div className="mt-1.5 sm:hidden">
            <p className={typeClass.caption}>
              {formatWeightLabel(data.weightKg)} · {formatSeriesLabel(data.series)} ·{' '}
              {formatRepsLabel(data.repsMin, data.repsMax)}
            </p>
          </div>
        ) : (
          <p className={cn('mt-1.5', typeClass.caption, 'text-text/70')}>
            {formatWeightLabel(data.weightKg)} · {formatSeriesLabel(data.series)} ·{' '}
            {formatRepsLabel(data.repsMin, data.repsMax)}
          </p>
        )}
      </div>

      {showStatsInline ? null : (
        <div className="hidden shrink-0 items-center gap-0 sm:flex">
          <span className={cn('min-w-[4.5rem] px-3 text-center', typeClass.body, 'text-text/70')}>
            {formatWeightLabel(data.weightKg)}
          </span>
          <span className="h-6 w-px bg-layer2" aria-hidden />
          <span className={cn('min-w-[5rem] px-3 text-center', typeClass.body, 'text-text/70')}>
            {formatSeriesLabel(data.series)}
          </span>
          <span className="h-6 w-px bg-layer2" aria-hidden />
          <span className={cn('min-w-[5.5rem] px-3 text-center', typeClass.body, 'text-text/70')}>
            {formatRepsLabel(data.repsMin, data.repsMax)}
          </span>
        </div>
      )}

      {readOnly ? null : (
        <button
          type="button"
          aria-label="Edit exercise"
          disabled={ui?.disabled}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-layer2 text-text/70 hover:text-text disabled:opacity-60"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={actions.onSettings}
        >
          <MdSettings className="h-5 w-5" aria-hidden />
        </button>
      )}
    </div>
  );
});
