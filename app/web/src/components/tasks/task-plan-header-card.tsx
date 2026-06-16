'use client';

import { TaskDaySummaryCard } from '@/components/tasks/task-day-summary-card';
import { PlanHeaderCard } from '@/components/ui/plan-header-card';
import { WeekdayNavigator } from '@/components/ui/weekday-navigator';
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
  };
  ui?: { loading?: boolean };
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
        <WeekdayNavigator
          weekdayLabel={data.weekdayLabel}
          weekdayShortLabel={data.weekdayShortLabel}
          onPrevDay={actions.onPrevDay}
          onNextDay={actions.onNextDay}
          disabled={ui?.loading}
        />
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
