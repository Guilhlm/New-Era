'use client';

import { cn } from '@/components/ui/cn';

type ProgressBarProps = {
  /** 0–100; values are clamped to that range. */
  percent: number;
  /** Tailwind classes for the filled portion (color). */
  fillClassName: string;
  /** Inline color for the filled portion (alternative to fillClassName). */
  fillColor?: string;
  /** Track height. */
  size?: 'sm' | 'md';
  className?: string;
};

const HEIGHT = { sm: 'h-1.5', md: 'h-2' } as const;

export function ProgressBar({
  percent,
  fillClassName,
  fillColor,
  size = 'md',
  className,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  const height = HEIGHT[size];

  return (
    <div className={cn('w-full shrink-0 rounded-full bg-layer2', height, className)}>
      <div
        className={cn('rounded-full transition-[width]', height, fillClassName)}
        style={{ width: `${clamped}%`, ...(fillColor ? { backgroundColor: fillColor } : {}) }}
        aria-hidden
      />
    </div>
  );
}
