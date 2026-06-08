'use client';

import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';

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
        'relative flex h-full min-h-0 flex-col overflow-hidden px-5 py-4 lg:px-6 lg:py-3',
        className,
      )}
      style={style}
    >
      <div className="relative flex h-full min-h-0 flex-col pb-[clamp(1rem,3vh,1.875rem)] pl-2.5">
        <div className="flex items-center justify-between gap-4 pt-[clamp(1rem,3vh,1.875rem)]">
          <p className="min-w-0 truncate text-lg font-semibold text-red">{title}</p>
          {rightSlot}
        </div>

        <div className={cn('mt-auto grid grid-cols-3 gap-2.5 pt-5', statsClassName)}>{statsSlot}</div>
      </div>
    </Card>
  );
}
