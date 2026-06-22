'use client';

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';
import {
  buildGoalDistributionSegments,
  FinanceGoalsDistributionDonut,
} from '@/components/finance-goals/finance-goals-distribution-donut';
import { computeGoalsTotals, type FinanceGoalVm } from '@/components/finance-goals/finance-goals-types';
import { typeClass, typeToneClass } from '@/lib/typography';
import { formatBrlAmount } from '@/utils/wallet';

type FinanceGoalsDistributionCardProps = {
  goals: FinanceGoalVm[];
  totalTarget: number;
  className?: string;
};

export function FinanceGoalsDistributionCard({
  goals,
  totalTarget,
  className,
}: FinanceGoalsDistributionCardProps) {
  const donutSegments = useMemo(() => buildGoalDistributionSegments(goals), [goals]);
  const totals = useMemo(() => computeGoalsTotals(goals), [goals]);

  return (
    <Card className={cn('flex h-full min-h-0 flex-col overflow-hidden p-5 lg:p-6', className)}>
      <div className="flex shrink-0 items-center justify-between gap-3">
        <h2 className={cn('min-w-0 truncate', typeClass.title, typeToneClass.default)}>Summary</h2>
        <p className={cn('shrink-0 tabular-nums', typeClass.caption, typeToneClass.muted60)}>
          {totals.activeCount} {totals.activeCount === 1 ? 'goal' : 'goals'}
        </p>
      </div>

      {donutSegments.length > 0 ? (
        <div className="mt-4 flex min-h-0 flex-1 overflow-hidden">
          <FinanceGoalsDistributionDonut
            className="h-full min-h-0 w-full"
            segments={donutSegments}
            centerLabel="Total target"
            centerValue={formatBrlAmount(totalTarget)}
          />
        </div>
      ) : (
        <div
          className={cn(
            'flex min-h-0 flex-1 items-center justify-center text-center',
            typeClass.caption,
            typeToneClass.muted60,
          )}
        >
          Create goals to see the distribution.
        </div>
      )}
    </Card>
  );
}
