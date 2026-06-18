'use client';

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
  const r = 50;
  const c = 2 * Math.PI * r;
  const longCenterValue = centerValue.length > 12;

  const arcs = segments.reduce<
    Array<{ key: string; color: string; dash: number; gap: number; offset: number }>
  >((acc, segment) => {
    const dash = c * (segment.percentOfTotal / 100);
    const offset = acc.length === 0 ? 0 : acc[acc.length - 1]!.offset - acc[acc.length - 1]!.dash;
    acc.push({
      key: segment.key,
      color: segment.color,
      dash,
      gap: c - dash,
      offset,
    });
    return acc;
  }, []);

  return (
    <div className={cn('flex h-full min-h-0 w-full items-center justify-center', className)}>
      <div className="relative aspect-square h-full max-h-full w-full max-w-full">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120" aria-hidden>
          <circle cx="60" cy="60" r={r} fill="none" stroke="var(--color-layer2)" strokeWidth="11" strokeLinecap="butt" />
          {arcs.map((arc) => (
            <circle
              key={arc.key}
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke={arc.color}
              strokeWidth="11"
              strokeDasharray={`${arc.dash} ${arc.gap}`}
              strokeDashoffset={arc.offset}
              strokeLinecap="butt"
            />
          ))}
        </svg>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-[12%] text-center">
          <span className={cn('uppercase tracking-wider', typeClass.body, typeToneClass.muted60)}>{centerLabel}</span>
          <span
            className={cn(
              'mt-1 max-w-full leading-tight tabular-nums',
              longCenterValue ? typeClass.bodyStrong : typeClass.title,
              typeToneClass.default,
            )}
          >
            {centerValue}
          </span>
        </div>
      </div>
    </div>
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
