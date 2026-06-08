'use client';

import type { TrainingDaySummaryStatVm } from '@/types/training';
import { StatProgressCard } from '@/components/ui/stat-progress-card';
import { TbBarbell, TbClock, TbWeight } from 'react-icons/tb';

const STAT_ICONS = {
  exercises: TbBarbell,
  duration: TbClock,
  volume: TbWeight,
} as const;

type TrainingDaySummaryCardProps = {
  data: TrainingDaySummaryStatVm;
  className?: string;
};

export function TrainingDaySummaryCard({ data, className }: TrainingDaySummaryCardProps) {
  return (
    <StatProgressCard
      className={className}
      data={{
        label: data.label,
        valueLabel: data.valueLabel,
        percent: data.percent,
        barClassName: data.barClassName,
        footerRight: data.subLabel,
        icon: STAT_ICONS[data.key],
      }}
    />
  );
}
