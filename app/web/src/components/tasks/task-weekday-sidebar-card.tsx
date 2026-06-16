'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';
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
      <p className={cn('text-center', typeClass.title, typeToneClass.default)}>{data.title}</p>

      <div className="scrollbar-none mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto">
        {data.days.map((day) => {
          const active = day.weekday === data.selectedWeekday;
          return (
            <button
              key={day.weekday}
              type="button"
              disabled={ui?.loading || ui?.saving}
              className={cn(
                'flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors',
                active
                  ? 'border-red bg-layer2-half/30'
                  : 'border-transparent bg-layer2-half/20 hover:bg-layer2-half/40',
              )}
              onClick={() => actions.onSelectDay(day.weekday)}
            >
              <span className={cn(typeClass.body, typeToneClass.default)}>{day.label}</span>
              <span
                className={cn(
                  'rounded-md px-2 py-0.5',
                  typeClass.micro,
                  active ? 'bg-layer2 text-text' : 'bg-layer2/60 text-text/60',
                )}
              >
                {day.taskCount} {day.taskCount === 1 ? 'task' : 'tasks'}
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
