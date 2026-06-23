'use client';

import { MdContentCopy, MdFileDownload } from 'react-icons/md';
import { TrainingDaySummaryCard } from '@/components/training/training-day-summary-card';
import { PlanHeaderCard } from '@/components/ui/plan-header-card';
import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';
import type { TrainingDaySummaryVm } from '@/types/training';

type TrainingPlanHeaderCardProps = {
  data: {
    title: string;
    weekdayLabel: string;
    planTitle: string;
    isActive: boolean;
    summary: TrainingDaySummaryVm;
  };
  actions?: {
    onExport: () => void;
    onCopyDay: () => void;
  };
  ui?: {
    loading?: boolean;
    saving?: boolean;
    exportDisabled?: boolean;
    exporting?: boolean;
  };
  className?: string;
  style?: React.CSSProperties;
};

export function TrainingPlanHeaderCard({
  data,
  actions,
  ui,
  className,
  style,
}: TrainingPlanHeaderCardProps) {
  return (
    <PlanHeaderCard
      title={data.title}
      className={className}
      style={style}
      rightSlot={
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Export training day as image"
            title="Export training"
            disabled={ui?.loading || ui?.exportDisabled}
            className={cn(
              'inline-flex h-10 items-center gap-1.5 rounded-lg bg-layer2-half px-3 text-text/70 transition-colors hover:bg-red/15 hover:text-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red/60 active:scale-95 disabled:opacity-50',
              typeClass.label,
            )}
            onClick={actions?.onExport}
          >
            <MdFileDownload className="h-4 w-4 shrink-0" aria-hidden />
            {ui?.exporting ? 'Exporting…' : 'Export Training'}
          </button>

          <button
            type="button"
            aria-label="Copy this day's workout to another day"
            title="Copy day"
            disabled={ui?.loading || ui?.saving}
            className={cn(
              'inline-flex h-10 items-center gap-1.5 rounded-lg bg-layer2-half px-3 text-text/70 transition-colors hover:bg-red/15 hover:text-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red/60 active:scale-95 disabled:opacity-50',
              typeClass.label,
            )}
            onClick={actions?.onCopyDay}
          >
            <MdContentCopy className="h-4 w-4 shrink-0" aria-hidden />
            Copy day
          </button>

          <div
            className={cn(
              'flex h-10 max-w-[min(100%,18rem)] shrink-0 items-center gap-3 rounded-lg px-5',
              data.isActive ? 'bg-layer2-half' : 'bg-layer2-half/60',
            )}
            title={`${data.weekdayLabel} · ${data.planTitle}`}
          >
            <span className={cn('truncate', typeClass.body, typeToneClass.default)}>
              {data.weekdayLabel}
            </span>
            <span className="h-4 w-px shrink-0 bg-text/20" aria-hidden />
            <span
              className={cn(
                'truncate',
                typeClass.body,
                data.isActive ? typeToneClass.accent : typeToneClass.muted,
              )}
            >
              {data.planTitle}
            </span>
          </div>
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
            <TrainingDaySummaryCard key={stat.key} data={stat} className="min-w-0" />
          ))
        )
      }
    />
  );
}
