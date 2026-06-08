'use client';

import { TrainingDaySummaryCard } from '@/components/training/training-day-summary-card';
import { PlanHeaderCard } from '@/components/ui/plan-header-card';
import { cn } from '@/components/ui/cn';
import type { TrainingDaySummaryVm } from '@/types/training';

type TrainingPlanHeaderCardProps = {
  data: {
    title: string;
    weekdayLabel: string;
    planTitle: string;
    isActive: boolean;
    summary: TrainingDaySummaryVm;
  };
  ui?: {
    loading?: boolean;
  };
  className?: string;
  style?: React.CSSProperties;
};

export function TrainingPlanHeaderCard({ data, ui, className, style }: TrainingPlanHeaderCardProps) {
  return (
    <PlanHeaderCard
      title={data.title}
      className={className}
      style={style}
      rightSlot={
        <div
          className={cn(
            'flex max-w-[min(100%,18rem)] shrink-0 items-center gap-3 rounded-lg px-5 py-2',
            data.isActive ? 'bg-layer2-half' : 'bg-layer2-half/60',
          )}
          title={`${data.weekdayLabel} · ${data.planTitle}`}
        >
          <span className="truncate text-sm font-normal text-text">{data.weekdayLabel}</span>
          <span className="h-4 w-px shrink-0 bg-text/20" aria-hidden />
          <span
            className={cn(
              'truncate text-sm font-normal',
              data.isActive ? 'text-red' : 'text-text/55',
            )}
          >
            {data.planTitle}
          </span>
        </div>
      }
      statsSlot={
        ui?.loading ? (
          <>
            <div className="h-[6.75rem] animate-pulse rounded-[5px] bg-layer2-half" />
            <div className="h-[6.75rem] animate-pulse rounded-[5px] bg-layer2-half" />
            <div className="h-[6.75rem] animate-pulse rounded-[5px] bg-layer2-half" />
          </>
        ) : (
          data.summary.stats.map((stat) => <TrainingDaySummaryCard key={stat.key} data={stat} />)
        )
      }
    />
  );
}
