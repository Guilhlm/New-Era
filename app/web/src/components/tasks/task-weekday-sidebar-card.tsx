'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';
import {
  sidebarDayListClass,
  sidebarDayListFooterReserveClass,
  sidebarDayRowClass,
} from '@/components/ui/sidebar-day-row';
import { typeClass, typeToneClass } from '@/lib/typography';

type SidebarDay = {
  weekday: number;
  label: string;
  taskCount: number;
};

type TaskWeekdaySidebarCardProps = {
  data: {
    title: string;
    days: SidebarDay[];
    selectedWeekday: number;
  };
  actions: {
    onSelectDay: (weekday: number) => void;
    onEditPlan: () => void;
  };
  ui?: { loading?: boolean; saving?: boolean };
  className?: string;
};

export function TaskWeekdaySidebarCard({
  data,
  actions,
  ui,
  className,
}: TaskWeekdaySidebarCardProps) {
  return (
    <Card className={cn('flex h-full min-h-0 flex-col overflow-hidden p-5 lg:p-6', className)}>
      <p className={cn('shrink-0 text-center', typeClass.title, typeToneClass.default)}>{data.title}</p>

      <div className={sidebarDayListClass}>
        {data.days.map((day) => {
          const active = day.weekday === data.selectedWeekday;
          return (
            <button
              key={day.weekday}
              type="button"
              disabled={ui?.loading || ui?.saving}
              className={sidebarDayRowClass(
                active,
                'min-w-0 w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red/60',
              )}
              onClick={() => actions.onSelectDay(day.weekday)}
            >
              <span
                className={cn(
                  'min-w-0 truncate',
                  typeClass.body,
                  active ? typeToneClass.default : typeToneClass.muted60,
                )}
              >
                {day.label}
              </span>
              <span
                className={cn(
                  'shrink-0 rounded-md px-2 py-0.5',
                  typeClass.micro,
                  active ? 'bg-red/20 text-red' : 'bg-layer2/60 text-text/60',
                )}
              >
                {day.taskCount} {day.taskCount === 1 ? 'task' : 'tasks'}
              </span>
            </button>
          );
        })}
      </div>

      <Button
        type="button"
        variant="primary"
        size="md"
        disabled={ui?.loading || ui?.saving}
        className={sidebarDayListFooterReserveClass}
        onClick={actions.onEditPlan}
      >
        Edit Plan
      </Button>
    </Card>
  );
}
