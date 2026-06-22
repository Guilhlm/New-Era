'use client';

import { MdContentCopy } from 'react-icons/md';
import { DietMacroSummaryCard } from '@/components/diet/diet-macro-summary-card';
import { cn } from '@/components/ui/cn';
import { PlanHeaderCard } from '@/components/ui/plan-header-card';
import { WeekdayNavigator } from '@/components/ui/weekday-navigator';
import { typeClass } from '@/lib/typography';
import type { DietMacroSummaryVm } from '@/types/diet';

type DietPlanHeaderCardProps = {
  data: {
    title: string;
    weekdayLabel: string;
    weekdayShortLabel: string;
    macroSummaries: DietMacroSummaryVm[];
  };
  actions: {
    onPrevDay: () => void;
    onNextDay: () => void;
    onCopyDay: () => void;
  };
  ui?: {
    disabled?: boolean;
  };
  className?: string;
  style?: React.CSSProperties;
};

export function DietPlanHeaderCard({
  data,
  actions,
  ui,
  className,
  style,
}: DietPlanHeaderCardProps) {
  return (
    <PlanHeaderCard
      title={data.title}
      className={className}
      style={style}
      rightSlot={
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Copy this day's diet to another day"
            title="Copy day"
            disabled={ui?.disabled}
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
          />
        </div>
      }
      statsSlot={data.macroSummaries.map((summary) => (
        <DietMacroSummaryCard key={summary.key} data={summary} className="min-w-0" />
      ))}
    />
  );
}
