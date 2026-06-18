'use client';

import { cn } from '@/components/ui/cn';
import { typeClass } from '@/lib/typography';

type FinanceGoalsTrendLabelProps = {
  value: number;
  className?: string;
};

export function FinanceGoalsTrendLabel({ value, className }: FinanceGoalsTrendLabelProps) {
  const positive = value >= 0;

  return (
    <span
      className={cn(
        'tabular-nums',
        typeClass.micro,
        positive ? 'text-green' : 'text-red',
        className,
      )}
    >
      {positive ? '↑' : '↓'} {Math.abs(value).toLocaleString('en-US', { maximumFractionDigits: 1 })}% vs last
      month
    </span>
  );
}
