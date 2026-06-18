'use client';

import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';

type DietWaterProgressRingProps = {
  percent: number;
  className?: string;
};

export function DietWaterProgressRing({ percent, className }: DietWaterProgressRingProps) {
  const r = 18;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, percent));
  const dash = c * (clamped / 100);
  const gap = c - dash;

  return (
    <div className={cn('relative h-14 w-14 shrink-0', className)}>
      <svg className="h-full w-full -rotate-90" viewBox="0 0 44 44" aria-hidden>
        <circle cx="22" cy="22" r={r} fill="none" stroke="var(--color-layer2)" strokeWidth="3.5" />
        <circle
          cx="22"
          cy="22"
          r={r}
          fill="none"
          stroke="var(--color-wallet-usd)"
          strokeWidth="3.5"
          strokeDasharray={`${dash} ${gap}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className={cn('tabular-nums', typeClass.micro, typeToneClass.default)}>{clamped}%</span>
      </div>
    </div>
  );
}
