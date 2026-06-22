'use client';

import { DistributionDonut } from '@/components/ui/distribution-donut';
import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';

export type FinanceGoalDonutSegmentVm = {
  key: string;
  label: string;
  value: number;
  percentOfTotal: number;
  color: string;
};

type FinanceGoalsDistributionDonutProps = {
  segments: FinanceGoalDonutSegmentVm[];
  centerLabel: string;
  centerValue: string;
  className?: string;
};

export function FinanceGoalsDistributionDonut({
  segments,
  centerLabel,
  centerValue,
  className,
}: FinanceGoalsDistributionDonutProps) {
  const longCenterValue = centerValue.length > 12;

  return (
    <DistributionDonut
      size="fill"
      segments={segments}
      className={className}
      centerPaddingClassName="px-[12%]"
      center={
        <>
          <span className={cn('uppercase tracking-wider', typeClass.body, typeToneClass.muted60)}>
            {centerLabel}
          </span>
          <span
            className={cn(
              'mt-1 max-w-full leading-tight tabular-nums',
              longCenterValue ? typeClass.bodyStrong : typeClass.title,
              typeToneClass.default,
            )}
          >
            {centerValue}
          </span>
        </>
      }
    />
  );
}

function normalizePercents(values: number[]) {
  const total = values.reduce((sum, value) => sum + value, 0);
  if (total <= 0) return values.map(() => 0);

  const raw = values.map((value) => (value / total) * 100);
  const floored = raw.map((percent) => Math.floor(percent));
  const result = [...floored];
  let remainder = 100 - result.reduce((sum, percent) => sum + percent, 0);

  const ranked = raw
    .map((percent, index) => ({ index, fraction: percent - floored[index]! }))
    .sort((a, b) => b.fraction - a.fraction);

  for (let i = 0; i < remainder; i++) {
    const entry = ranked[i];
    if (!entry) break;
    result[entry.index] = (result[entry.index] ?? 0) + 1;
  }

  return result;
}

export function buildGoalDistributionSegments(
  goals: { id: string; label: string; target: number; accent: { color: string } }[],
) {
  const totalTarget = goals.reduce((sum, goal) => sum + goal.target, 0);
  if (totalTarget <= 0) return [];

  const percents = normalizePercents(goals.map((goal) => goal.target));

  return goals
    .map((goal, index) => ({
      key: goal.id,
      label: goal.label,
      value: goal.target,
      percentOfTotal: percents[index] ?? 0,
      color: goal.accent.color,
    }))
    .sort((a, b) => b.percentOfTotal - a.percentOfTotal);
}
