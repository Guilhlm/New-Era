'use client';

import { cn } from '@/components/ui/cn';
import { sidebarDayRowClass } from '@/components/ui/sidebar-day-row';
import { WeekdayPlanSidebarCard } from '@/components/ui/weekday-plan-sidebar-card';
import { typeClass, typeToneClass } from '@/lib/typography';
import { TrainingPlanDayMenu } from '@/components/training/training-plan-day-menu';

type SidebarDay = {
  weekday: number;
  label: string;
  displayTitle: string;
  sheetTitle: string | null;
  isActive: boolean;
};

type TrainingPlanSidebarCardProps = {
  data: {
    title: string;
    days: SidebarDay[];
    selectedWeekday: number;
  };
  actions: {
    onSelectDay: (weekday: number) => void;
    onSelectRestDay: (weekday: number) => void;
    onSelectSheet: (weekday: number) => void;
    onRemoveSheet: (weekday: number) => void;
    onEditPlan: () => void;
  };
  ui?: {
    loading?: boolean;
    saving?: boolean;
  };
  className?: string;
};

export function TrainingPlanSidebarCard({
  data,
  actions,
  ui,
  className,
}: TrainingPlanSidebarCardProps) {
  const busy = Boolean(ui?.loading || ui?.saving);

  return (
    <WeekdayPlanSidebarCard
      title={data.title}
      days={data.days}
      selectedWeekday={data.selectedWeekday}
      editDisabled={Boolean(ui?.saving)}
      onEditPlan={actions.onEditPlan}
      className={className}
      renderDay={(day, active) => (
        <div key={day.weekday} className={cn(sidebarDayRowClass(active), 'min-w-0')}>
          <button
            type="button"
            disabled={busy}
            className="flex min-h-0 min-w-0 flex-1 items-center gap-1.5 overflow-hidden text-left focus-visible:outline-none"
            onClick={() => actions.onSelectDay(day.weekday)}
          >
            <span
              className={cn(
                'shrink-0',
                typeClass.body,
                active ? typeToneClass.default : typeToneClass.muted60,
              )}
            >
              {day.label}:
            </span>
            <span className={cn('truncate', typeClass.body, active ? 'text-text' : 'text-text/80')}>
              {day.displayTitle}
            </span>
          </button>

          <TrainingPlanDayMenu
            displayTitle={day.displayTitle}
            sheetTitle={day.sheetTitle}
            isActive={day.isActive}
            disabled={busy}
            onSelectRestDay={() => actions.onSelectRestDay(day.weekday)}
            onSelectSheet={() => actions.onSelectSheet(day.weekday)}
            onRemoveSheet={() => actions.onRemoveSheet(day.weekday)}
          />
        </div>
      )}
    />
  );
}
