'use client';

import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';

type PeriodNavigatorProps = {
  periodLabel: string;
  periodShortLabel: string;
  onPrev: () => void;
  onNext: () => void;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
  prevAriaLabel?: string;
  nextAriaLabel?: string;
};

export function PeriodNavigator({
  periodLabel,
  periodShortLabel,
  onPrev,
  onNext,
  disabled = false,
  className,
  ariaLabel = 'Select period',
  prevAriaLabel = 'Previous period',
  nextAriaLabel = 'Next period',
}: PeriodNavigatorProps) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center rounded-lg bg-layer2-half p-1',
        className,
      )}
      role="group"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        aria-label={prevAriaLabel}
        disabled={disabled}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-text/70 transition-colors hover:bg-red/15 hover:text-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red/60 active:scale-95 disabled:opacity-50"
        onClick={onPrev}
      >
        <MdChevronLeft className="h-5 w-5" aria-hidden />
      </button>

      <span className={cn('min-w-[3.25rem] px-2 text-center sm:min-w-[6.75rem]', typeClass.body, typeToneClass.default)}>
        <span className="sm:hidden">{periodShortLabel}</span>
        <span className="hidden sm:inline">{periodLabel}</span>
      </span>

      <button
        type="button"
        aria-label={nextAriaLabel}
        disabled={disabled}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-text/70 transition-colors hover:bg-red/15 hover:text-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red/60 active:scale-95 disabled:opacity-50"
        onClick={onNext}
      >
        <MdChevronRight className="h-5 w-5" aria-hidden />
      </button>
    </div>
  );
}
