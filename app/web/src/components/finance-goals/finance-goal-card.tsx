'use client';

import { cn } from '@/components/ui/cn';
import { ProgressBar } from '@/components/ui/progress-bar';
import {
  computeGoalPercent,
  computeGoalRemaining,
  type FinanceGoalVm,
} from '@/components/finance-goals/finance-goals-types';
import { typeClass, typeToneClass } from '@/lib/typography';
import { formatBrlAmount } from '@/utils/wallet';

type FinanceGoalCardProps = {
  goal: FinanceGoalVm;
  variant?: 'default' | 'compact';
  className?: string;
};

export function FinanceGoalCard({ goal, variant = 'default', className }: FinanceGoalCardProps) {
  const percent = computeGoalPercent(goal);
  const remaining = computeGoalRemaining(goal);
  const Icon = goal.icon;
  const compact = variant === 'compact';

  return (
    <div
      className={cn(
        'flex w-full overflow-hidden rounded-[5px] bg-layer2-half',
        compact ? 'min-h-[7rem]' : 'min-h-[8.25rem]',
        className,
      )}
    >
      <div
        className={cn('flex shrink-0 items-center justify-center self-stretch', compact ? 'w-9' : 'w-10')}
        style={{ backgroundColor: goal.accent.color }}
      >
        <Icon className={cn('text-white', compact ? 'h-4 w-4' : 'h-[1.125rem] w-[1.125rem]')} aria-hidden />
      </div>

      <div className={cn('flex min-w-0 flex-1 flex-col', compact ? 'px-3 py-2.5' : 'px-3.5 py-3')}>
        <div className="flex min-h-0 flex-1 items-stretch justify-between gap-6">
          <div className="flex min-w-0 flex-1 flex-col">
            <p className={cn('truncate', compact ? typeClass.caption : typeClass.bodyStrong, typeToneClass.default)}>
              {goal.label}
            </p>
            <p className={cn('mt-1 truncate tabular-nums', typeClass.micro, typeToneClass.muted60)}>
              Target: {formatBrlAmount(goal.target)}
            </p>
            <p className={cn('mt-auto truncate tabular-nums', typeClass.micro, typeToneClass.muted60)}>
              Saved: {formatBrlAmount(goal.current)}
            </p>
          </div>

          <div className="flex shrink-0 flex-col text-right">
            <p className={cn('tabular-nums', typeClass.micro, typeToneClass.muted60)}>{goal.deadline}</p>
            <p className={cn('mt-1 tabular-nums', typeClass.micro, typeToneClass.muted60)}>
              Remaining: {formatBrlAmount(remaining)}
            </p>
            <p
              className={cn(
                'mt-auto tabular-nums leading-none',
                compact ? typeClass.bodyStrong : typeClass.title,
              )}
              style={{ color: goal.accent.color }}
            >
              {percent}%
            </p>
          </div>
        </div>

        <ProgressBar
          percent={percent}
          fillClassName={goal.accent.barClassName}
          size={compact ? 'sm' : 'md'}
          className={compact ? 'mt-2' : 'mt-3'}
        />
      </div>
    </div>
  );
}
