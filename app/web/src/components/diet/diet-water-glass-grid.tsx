'use client';

import { cn } from '@/components/ui/cn';
import { MdAdd } from 'react-icons/md';

type DietWaterGlassGridProps = {
  data: {
    glassCount: number;
    filledCount: number;
  };
  actions: {
    onGlassClick: (index: number) => void;
  };
  ui?: {
    disabled?: boolean;
  };
};

function buildGlassRows(glassCount: number) {
  if (glassCount <= 0) return [];
  if (glassCount === 1) return [[0]];

  const firstRowCount = Math.floor(glassCount / 2);
  const secondRowCount = glassCount - firstRowCount;

  const row1 = Array.from({ length: firstRowCount }, (_, index) => index);
  const row2 = Array.from({ length: secondRowCount }, (_, offset) => firstRowCount + offset);

  return [row1, row2];
}

export function DietWaterGlassGrid({ data, actions, ui }: DietWaterGlassGridProps) {
  const rows = buildGlassRows(data.glassCount);

  return (
    <div className="flex w-full min-w-0 flex-col gap-2">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex w-full min-w-0 items-end gap-1.5 sm:gap-2">
          {row.map((index) => {
            const filled = index < data.filledCount;
            const isNextEmpty = index === data.filledCount;
            const clickable = filled || isNextEmpty;

            return (
              <button
                key={index}
                type="button"
                aria-label={
                  filled ? 'Esvaziar copo' : isNextEmpty ? 'Adicionar água' : 'Copo vazio'
                }
                disabled={ui?.disabled || !clickable}
                className={cn(
                  'flex h-11 min-w-0 flex-1 items-end justify-center rounded-md border border-layer2 bg-layer2/40 pb-1 sm:h-12',
                  clickable && 'cursor-pointer hover:bg-layer2/70',
                )}
                onClick={() => {
                  if (clickable) actions.onGlassClick(index);
                }}
              >
                {filled ? (
                  <div className="h-7 w-4 rounded-sm bg-blue-400/90 sm:h-8 sm:w-5" aria-hidden />
                ) : isNextEmpty ? (
                  <MdAdd className="h-4 w-4 text-blue-400/90 sm:h-5 sm:w-5" aria-hidden />
                ) : (
                  <div
                    className="h-7 w-4 rounded-sm border border-dashed border-text/20 sm:h-8 sm:w-5"
                    aria-hidden
                  />
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
