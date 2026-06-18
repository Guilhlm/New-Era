'use client';

import type { ReactNode } from 'react';
import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';
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
  footerStacked?: boolean;
};

type StatProgressCardProps = {
  data: StatProgressCardVm;
  className?: string;
  headerActions?: ReactNode;
};

export function StatProgressCard({ data, className, headerActions }: StatProgressCardProps) {
  const percent = Math.min(100, Math.max(0, data.percent));
  const Icon = data.icon;

  return (
    <div className={cn('flex h-full min-h-0 w-full flex-col rounded-[5px] bg-layer2-half px-4 py-3.5', className)}>
      <div className="min-h-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {Icon ? <Icon className="h-4 w-4 shrink-0 text-red/80" aria-hidden /> : null}
            <p
              className={cn(
                'truncate uppercase tracking-wider',
                typeClass.overline,
                typeToneClass.muted60,
                data.labelClassName,
              )}
            >
              {data.label}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <p
              className={cn(
                'shrink-0 tabular-nums',
                typeClass.title,
                typeToneClass.default,
                data.valueClassName,
              )}
            >
              {data.valueLabel}
            </p>
            {headerActions}
          </div>
        </div>

        {data.footerLeft ? (
          data.footerStacked ? (
            <div className={cn('mt-2 min-w-0 space-y-0.5', typeClass.caption)}>
              <p className="truncate tabular-nums">{data.footerLeft}</p>
              <p className={cn('truncate', typeClass.body, 'text-text/75')}>{data.footerRight}</p>
            </div>
          ) : (
            <div className={cn('mt-2 flex min-w-0 items-center justify-between gap-2', typeClass.caption)}>
              <span className="min-w-0 truncate">{data.footerLeft}</span>
              <span className={cn('min-w-0 truncate text-right', typeClass.body, 'text-text/75')}>
                {data.footerRight}
              </span>
            </div>
          )
        ) : (
          <p className={cn('mt-2 min-w-0 truncate', typeClass.caption, 'text-text/75')}>{data.footerRight}</p>
        )}
      </div>

      <div className={cn('mt-3 w-full shrink-0 rounded-full bg-layer2', data.barHeightClassName ?? 'h-2.5')}>
        <div
          className={cn(
            'rounded-full transition-[width]',
            data.barHeightClassName ?? 'h-2.5',
            data.barClassName,
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
