'use client';

import { useMemo, useState } from 'react';
import { MdExpandMore } from 'react-icons/md';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';
import { dashboardMainBodyCardPaddingClass } from '@/components/ui/dashboard-two-column-layout';
import { sidebarDayListFooterReserveClass } from '@/components/ui/sidebar-day-row';
import { FinanceGoalCard } from '@/components/finance-goals/finance-goal-card';
import {
  sortFinanceGoals,
  type FinanceGoalSortKey,
  type FinanceGoalVm,
} from '@/components/finance-goals/finance-goals-types';
import { typeClass, typeToneClass } from '@/lib/typography';

const SORT_OPTIONS: { key: FinanceGoalSortKey; label: string }[] = [
  { key: 'progress', label: 'Progress' },
  { key: 'name', label: 'Name' },
  { key: 'deadline', label: 'Deadline' },
  { key: 'target', label: 'Amount' },
];

type FinanceGoalsActiveListProps = {
  goals: FinanceGoalVm[];
  onCreate: () => void;
  className?: string;
  style?: React.CSSProperties;
};

export function FinanceGoalsActiveList({
  goals,
  onCreate,
  className,
  style,
}: FinanceGoalsActiveListProps) {
  const [sortKey, setSortKey] = useState<FinanceGoalSortKey>('progress');

  const sortedGoals = useMemo(() => sortFinanceGoals(goals, sortKey), [goals, sortKey]);

  return (
    <Card
      className={cn('flex h-full min-h-0 flex-col overflow-hidden', dashboardMainBodyCardPaddingClass, className)}
      style={style}
    >
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <p className={cn('min-w-0 truncate', typeClass.title, typeToneClass.default)}>Active goals</p>

        <label className={cn('flex shrink-0 items-center gap-2 rounded-lg bg-layer2 p-1', typeClass.caption, typeToneClass.muted60)}>
          <span className="relative rounded-md bg-layer2">
            <select
              value={sortKey}
              aria-label="Sort goals"
              onChange={(event) => setSortKey(event.target.value as FinanceGoalSortKey)}
              className={cn(
                'h-8 min-w-[6.75rem] cursor-pointer appearance-none rounded-md bg-layer2 py-0 pl-2.5 pr-7 text-text outline-none focus-visible:ring-2 focus-visible:ring-red/60',
                typeClass.body,
                typeToneClass.default,
              )}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
            <MdExpandMore
              className="pointer-events-none absolute right-1.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text/60"
              aria-hidden
            />
          </span>
        </label>
      </div>

      <div className="scrollbar-none mt-4 flex min-h-0 flex-1 flex-col gap-2 overflow-auto pr-1">
        {sortedGoals.length === 0 ? (
          <div
            className={cn(
              'flex min-h-[12rem] flex-1 items-center justify-center rounded-[5px] bg-layer2-half px-4',
              typeClass.body,
              typeToneClass.muted60,
            )}
          >
            No active goals. Create the first one with the button below.
          </div>
        ) : (
          sortedGoals.map((goal) => <FinanceGoalCard key={goal.id} goal={goal} />)
        )}
      </div>

      <Button type="button" variant="primary" size="md" className={sidebarDayListFooterReserveClass} onClick={onCreate}>
        New goal
      </Button>
    </Card>
  );
}
