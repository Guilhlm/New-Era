'use client';

import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';

type PlanHeaderCardProps = {
  title: string;
  rightSlot: ReactNode;
  statsSlot: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  statsClassName?: string;
};

export function PlanHeaderCard({
  title,
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
        <div className="flex h-10 items-center justify-between gap-4">
          <p className={cn('min-w-0 truncate', typeClass.title, typeToneClass.accent)}>{title}</p>
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
