'use client';

import { cn } from '@/components/ui/cn';
import type { IconType } from 'react-icons';

export type StatProgressCardVm = {
  label: string;
  valueLabel: string;
  percent: number;
  barClassName: string;
  footerLeft?: string;
  footerRight: string;
  labelClassName?: string;
  valueClassName?: string;
  barHeightClassName?: string;
  icon?: IconType;
};

type StatProgressCardProps = {
  data: StatProgressCardVm;
  className?: string;
};

export function StatProgressCard({ data, className }: StatProgressCardProps) {
  const percent = Math.min(100, Math.max(0, data.percent));
  const Icon = data.icon;

  return (
    <div className={cn('rounded-[5px] bg-layer2-half px-4 py-3.5', className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {Icon ? <Icon className="h-4 w-4 shrink-0 text-red/80" aria-hidden /> : null}
          <p
            className={cn(
              'truncate text-xs font-semibold uppercase tracking-wider text-text/60',
              data.labelClassName,
            )}
          >
            {data.label}
          </p>
        </div>
        <p
          className={cn(
            'shrink-0 truncate text-xl font-bold tabular-nums text-text',
            data.valueClassName,
          )}
        >
          {data.valueLabel}
        </p>
      </div>

      <div className={cn('mt-3 w-full rounded-full bg-layer2', data.barHeightClassName ?? 'h-2.5')}>
        <div
          className={cn(
            'rounded-full transition-[width]',
            data.barHeightClassName ?? 'h-2.5',
            data.barClassName,
          )}
          style={{ width: `${percent}%` }}
        />
      </div>

      {data.footerLeft ? (
        <div className="mt-2 flex items-center justify-between gap-2 text-xs text-text/60">
          <span className="truncate">{data.footerLeft}</span>
          <span className="truncate font-semibold text-text/80">{data.footerRight}</span>
        </div>
      ) : (
        <p className="mt-2 truncate text-sm font-medium text-text/75">{data.footerRight}</p>
      )}
    </div>
  );
}
