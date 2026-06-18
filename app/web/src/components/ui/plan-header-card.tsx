'use client';

import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';

type PlanHeaderCardProps = {
  title: string;
  subtitle?: string;
  rightSlot: ReactNode;
  statsSlot: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  statsClassName?: string;
};

export function PlanHeaderCard({
  title,
  subtitle,
  rightSlot,
  statsSlot,
  className,
  style,
  statsClassName,
}: PlanHeaderCardProps) {
  return (
    <Card
      className={cn(
        'relative flex h-full min-h-0 flex-col overflow-hidden px-6 py-4 lg:px-8 lg:py-3',
        className,
      )}
      style={style}
    >
      <div className="relative flex h-full min-h-0 flex-col pb-4 pt-4">
        <div
          className={cn(
            'flex justify-between gap-4',
            subtitle ? 'min-h-10 items-start' : 'h-10 items-center',
          )}
        >
          <div className="min-w-0">
            <p className={cn('truncate', typeClass.title, typeToneClass.accent)}>{title}</p>
            {subtitle ? (
              <p className={cn('mt-0.5 truncate', typeClass.caption, typeToneClass.muted60)}>{subtitle}</p>
            ) : null}
          </div>
          {rightSlot}
        </div>

        <div
          className={cn(
            'mt-auto grid w-full min-w-0 grid-cols-[repeat(3,minmax(0,1fr))] gap-2.5 pt-5',
            statsClassName,
          )}
        >
          {statsSlot}
        </div>
      </div>
    </Card>
  );
}
