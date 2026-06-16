'use client';

import { StatProgressCard } from '@/components/ui/stat-progress-card';
import type { TaskDaySummaryStatVm } from '@/types/task';
import { TbCheckbox, TbClock, TbListNumbers } from 'react-icons/tb';

const STAT_ICONS = {
  tasks: TbListNumbers,
  completed: TbCheckbox,
  next: TbClock,
} as const;

type TaskDaySummaryCardProps = {
  data: TaskDaySummaryStatVm;
  className?: string;
};

export function TaskDaySummaryCard({ data, className }: TaskDaySummaryCardProps) {
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
