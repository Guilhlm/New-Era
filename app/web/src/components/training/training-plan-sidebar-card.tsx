'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';
import { sidebarDayListClass, sidebarDayListFooterReserveClass, sidebarDayRowClass } from '@/components/ui/sidebar-day-row';
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
  return (
    <Card className={cn('flex h-full min-h-0 flex-col overflow-hidden p-5 lg:p-6', className)}>
      <p className={cn('shrink-0 text-center', typeClass.title, typeToneClass.default)}>{data.title}</p>

      <div className={sidebarDayListClass}>
        {data.days.map((day) => {
          const active = day.weekday === data.selectedWeekday;
          return (
            <div key={day.weekday} className={cn(sidebarDayRowClass(active), 'min-w-0')}>
              <button
                type="button"
                disabled={ui?.loading || ui?.saving}
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
                disabled={ui?.loading || ui?.saving}
                onSelectRestDay={() => actions.onSelectRestDay(day.weekday)}
                onSelectSheet={() => actions.onSelectSheet(day.weekday)}
                onRemoveSheet={() => actions.onRemoveSheet(day.weekday)}
              />
            </div>
          );
        })}
      </div>

      <Button
        type="button"
        variant="primary"
        size="md"
        disabled={ui?.saving}
        className={sidebarDayListFooterReserveClass}
        onClick={actions.onEditPlan}
      >
        Edit Plan
      </Button>
    </Card>
  );
}
