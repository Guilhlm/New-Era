'use client';

import { cn } from '@/components/ui/cn';
import { sidebarDayRowClass } from '@/components/ui/sidebar-day-row';
import { WeekdayPlanSidebarCard } from '@/components/ui/weekday-plan-sidebar-card';
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
  const busy = Boolean(ui?.loading || ui?.saving);

  return (
    <WeekdayPlanSidebarCard
      title={data.title}
      days={data.days}
      selectedWeekday={data.selectedWeekday}
      editDisabled={busy}
      onEditPlan={actions.onEditPlan}
      className={className}
      renderDay={(day, active) => (
        <button
          key={day.weekday}
          type="button"
          disabled={busy}
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
      )}
    />
  );
}
