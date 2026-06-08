'use client';

import { StatProgressCard } from '@/components/ui/stat-progress-card';
import type { DietMacroSummaryVm } from '@/types/diet';

type DietMacroSummaryCardProps = {
  data: DietMacroSummaryVm;
  className?: string;
};

export function DietMacroSummaryCard({ data, className }: DietMacroSummaryCardProps) {
  return (
    <StatProgressCard
      className={className}
      data={{
        label: data.label,
        valueLabel: data.consumedLabel,
        percent: data.percent,
        barClassName: data.barClassName,
        footerLeft: 'Tot Target',
        footerRight: data.targetLabel,
        labelClassName: 'text-sm tracking-wide text-text',
        valueClassName: 'font-semibold',
        barHeightClassName: 'h-2',
      }}
    />
  );
}
