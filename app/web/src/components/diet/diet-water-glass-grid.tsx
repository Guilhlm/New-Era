'use client';

import { cn } from '@/components/ui/cn';
import { typeClass } from '@/lib/typography';
import { buildGlassRows, formatGlassVolumeLabel } from '@/utils/water-intake';
import { MdAdd } from 'react-icons/md';

type DietWaterGlassGridProps = {
  data: {
    glassCount: number;
    filledCount: number;
    isComplete: boolean;
    perGlass: number;
  };
  actions: {
    onGlassClick: (index: number) => void;
  };
  ui?: {
    disabled?: boolean;
  };
};

function WaterWaveFill() {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        fill="var(--color-wallet-usd)"
        fillOpacity="0.9"
        d="M0,22 C18,10 32,26 50,18 C68,10 82,24 100,16 L100,100 L0,100 Z"
      />
      <path
        fill="var(--color-wallet-usd)"
        fillOpacity="0.35"
        d="M0,26 C20,18 35,30 55,24 C72,18 88,28 100,22 L100,100 L0,100 Z"
      />
    </svg>
  );
}

export function DietWaterGlassGrid({ data, actions, ui }: DietWaterGlassGridProps) {
  const rows = buildGlassRows();
  const volumeLabel = formatGlassVolumeLabel(data.perGlass);

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-2">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex min-h-0 w-full min-w-0 flex-1 items-stretch gap-1.5 sm:gap-2">
          {row.map((index) => {
            if (index >= data.glassCount) {
              return <div key={index} className="min-w-0 flex-1" aria-hidden />;
            }

            const filled = index < data.filledCount;
            const isNextEmpty = !data.isComplete && index === data.filledCount;
            const clickable = filled || isNextEmpty;

            return (
              <div key={index} className="flex min-h-0 min-w-0 flex-1 flex-col gap-1">
                <button
                  type="button"
                  aria-label={
                    filled ? 'Empty glass' : isNextEmpty ? 'Add water' : 'Empty glass slot'
                  }
                  disabled={ui?.disabled || !clickable}
                  className={cn(
                    'relative min-h-0 flex-1 overflow-hidden rounded-md border border-layer2 bg-layer2/40',
                    clickable && 'cursor-pointer hover:bg-layer2/70',
                  )}
                  onClick={() => {
                    if (clickable) actions.onGlassClick(index);
                  }}
                >
                  {filled ? (
                    <WaterWaveFill />
                  ) : isNextEmpty ? (
                    <div className="flex h-full w-full items-center justify-center border border-dashed border-text/20">
                      <MdAdd className="h-4 w-4 text-[color:var(--color-wallet-usd)] sm:h-5 sm:w-5" aria-hidden />
                    </div>
                  ) : (
                    <div className="h-full w-full border border-dashed border-text/15" aria-hidden />
                  )}
                </button>

                {filled ? (
                  <span
                    className={cn(
                      'shrink-0 text-center tabular-nums text-[color:var(--color-wallet-usd)]',
                      typeClass.micro,
                    )}
                  >
                    {volumeLabel}
                  </span>
                ) : (
                  <span className="shrink-0 text-center opacity-0" aria-hidden>
                    {volumeLabel}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
