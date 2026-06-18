'use client';

import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';
import { formatBrlAmount } from '@/utils/wallet';

type MonthlyExpensesCategoryCardProps = {
  label: string;
  spent: number;
  budget: number;
  className?: string;
};

function barTone(percent: number) {
  if (percent >= 100) return 'bg-red';
  if (percent >= 85) return 'bg-red/80';
  return 'bg-green';
}

function percentTone(percent: number) {
  if (percent >= 100) return 'text-red';
  if (percent >= 85) return 'text-red/90';
  return 'text-green';
}

export function MonthlyExpensesCategoryCard({
  label,
  spent,
  budget,
  className,
}: MonthlyExpensesCategoryCardProps) {
  const percent = budget > 0 ? Math.round((spent / budget) * 100) : 0;
  const clampedPercent = Math.min(100, percent);

  return (
    <div className={cn('min-w-0 w-full rounded-[5px] bg-layer2-half px-4 py-3.5', className)}>
      <div className="flex items-center justify-between gap-3">
        <p className={cn('min-w-0 truncate', typeClass.body, typeToneClass.muted60)}>{label}</p>
        <p className={cn('shrink-0 tabular-nums', typeClass.body, typeToneClass.muted60)}>
          Budget: {formatBrlAmount(budget)}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className={cn('min-w-0 truncate tabular-nums', typeClass.body, typeToneClass.muted60)}>
          Spent: {formatBrlAmount(spent)}
        </p>
        <p className={cn('shrink-0 tabular-nums', typeClass.title, percentTone(percent))}>{percent}%</p>
      </div>

      <div className="mt-3 h-2 w-full rounded-full bg-layer2">
        <div
          className={cn('h-2 rounded-full transition-[width]', barTone(percent))}
          style={{ width: `${clampedPercent}%` }}
          aria-hidden
        />
      </div>
    </div>
  );
}
