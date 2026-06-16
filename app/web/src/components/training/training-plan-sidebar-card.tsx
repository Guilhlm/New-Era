'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';
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
      <p className={cn('text-center', typeClass.title, typeToneClass.default)}>{data.title}</p>

      <div className="scrollbar-none mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto">
        {data.days.map((day) => {
          const active = day.weekday === data.selectedWeekday;
          return (
            <div
              key={day.weekday}
              className={cn(
                'flex w-full items-center justify-between rounded-lg border px-4 py-3 transition-colors',
                active
                  ? 'border-red bg-layer2-half/30'
                  : 'border-transparent bg-layer2-half/20 hover:bg-layer2-half/40',
              )}
            >
              <button
                type="button"
                disabled={ui?.loading || ui?.saving}
                className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
                onClick={() => actions.onSelectDay(day.weekday)}
              >
                <span className={cn('shrink-0', typeClass.body, typeToneClass.default)}>{day.label}:</span>
                <span className={cn('truncate', typeClass.body, 'text-text/80')}>{day.displayTitle}</span>
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
        className="mt-4 h-10 w-full shrink-0"
        onClick={actions.onEditPlan}
      >
        Edit Plan
      </Button>
    </Card>
  );
}
