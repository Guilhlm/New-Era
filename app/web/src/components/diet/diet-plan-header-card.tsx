'use client';

import { DietMacroSummaryCard } from '@/components/diet/diet-macro-summary-card';
import { PlanHeaderCard } from '@/components/ui/plan-header-card';
import { WeekdayNavigator } from '@/components/ui/weekday-navigator';
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
  };
  className?: string;
  style?: React.CSSProperties;
};

export function DietPlanHeaderCard({
  data,
  actions,
  className,
  style,
}: DietPlanHeaderCardProps) {
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
        />
      }
      statsSlot={data.macroSummaries.map((summary) => (
        <DietMacroSummaryCard key={summary.key} data={summary} className="min-w-0" />
      ))}
    />
  );
}
