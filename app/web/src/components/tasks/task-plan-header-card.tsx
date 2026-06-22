'use client';

import { MdContentCopy } from 'react-icons/md';
import { TaskDaySummaryCard } from '@/components/tasks/task-day-summary-card';
import { cn } from '@/components/ui/cn';
import { PlanHeaderCard } from '@/components/ui/plan-header-card';
import { WeekdayNavigator } from '@/components/ui/weekday-navigator';
import { typeClass } from '@/lib/typography';
import type { TaskDaySummaryVm } from '@/types/task';

type TaskPlanHeaderCardProps = {
  data: {
    title: string;
    weekdayLabel: string;
    weekdayShortLabel: string;
    summary: TaskDaySummaryVm;
  };
  actions: {
    onPrevDay: () => void;
    onNextDay: () => void;
    onCopyDay: () => void;
  };
  ui?: { loading?: boolean; saving?: boolean };
  className?: string;
  style?: React.CSSProperties;
};

export function TaskPlanHeaderCard({
  data,
  actions,
  ui,
  className,
  style,
}: TaskPlanHeaderCardProps) {
  return (
    <PlanHeaderCard
      title={data.title}
      className={className}
      style={style}
      rightSlot={
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Copy this day's tasks to another day"
            title="Copy day"
            disabled={ui?.loading || ui?.saving}
            className={cn(
              'inline-flex h-10 items-center gap-1.5 rounded-lg bg-layer2-half px-3 text-text/70 transition-colors hover:bg-red/15 hover:text-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red/60 active:scale-95 disabled:opacity-50',
              typeClass.label,
            )}
            onClick={actions.onCopyDay}
          >
            <MdContentCopy className="h-4 w-4" aria-hidden />
            Copy day
          </button>
          <WeekdayNavigator
            weekdayLabel={data.weekdayLabel}
            weekdayShortLabel={data.weekdayShortLabel}
            onPrevDay={actions.onPrevDay}
            onNextDay={actions.onNextDay}
            disabled={ui?.loading}
          />
        </div>
      }
      statsSlot={
        ui?.loading ? (
          <>
            <div className="h-[6.75rem] min-w-0 animate-pulse rounded-[5px] bg-layer2-half" />
            <div className="h-[6.75rem] min-w-0 animate-pulse rounded-[5px] bg-layer2-half" />
            <div className="h-[6.75rem] min-w-0 animate-pulse rounded-[5px] bg-layer2-half" />
          </>
        ) : (
          data.summary.stats.map((stat) => (
            <TaskDaySummaryCard key={stat.key} data={stat} className="min-w-0" />
          ))
        )
      }
    />
  );
}
