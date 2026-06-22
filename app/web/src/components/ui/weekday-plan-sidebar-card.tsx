'use client';

import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';
import {
  sidebarDayListClass,
  sidebarDayListFooterReserveClass,
} from '@/components/ui/sidebar-day-row';
import { typeClass, typeToneClass } from '@/lib/typography';

type WeekdayLike = { weekday: number };

type WeekdayPlanSidebarCardProps<T extends WeekdayLike> = {
  title: string;
  days: T[];
  selectedWeekday: number;
  /** Renders a single weekday row; receives the active flag for styling. */
  renderDay: (day: T, active: boolean) => ReactNode;
  onEditPlan: () => void;
  footerLabel?: string;
  editDisabled?: boolean;
  className?: string;
};

export function WeekdayPlanSidebarCard<T extends WeekdayLike>({
  title,
  days,
  selectedWeekday,
  renderDay,
  onEditPlan,
  footerLabel = 'Edit Plan',
  editDisabled = false,
  className,
}: WeekdayPlanSidebarCardProps<T>) {
  return (
    <Card className={cn('flex h-full min-h-0 flex-col overflow-hidden p-5 lg:p-6', className)}>
      <p className={cn('shrink-0 text-center', typeClass.title, typeToneClass.default)}>{title}</p>

      <div className={sidebarDayListClass}>
        {days.map((day) => renderDay(day, day.weekday === selectedWeekday))}
      </div>

      <Button
        type="button"
        variant="primary"
        size="md"
        disabled={editDisabled}
        className={sidebarDayListFooterReserveClass}
        onClick={onEditPlan}
      >
        {footerLabel}
      </Button>
    </Card>
  );
}
