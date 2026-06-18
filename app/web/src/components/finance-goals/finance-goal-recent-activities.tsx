'use client';

import { useState } from 'react';
import { MdDelete } from 'react-icons/md';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/cn';
import { NativeDialog } from '@/components/ui/native-dialog';
import type { FinanceGoalActivityVm } from '@/components/finance-goals/finance-goals-types';
import { typeClass, typeToneClass } from '@/lib/typography';
import { formatWalletAmount } from '@/utils/wallet';

type FinanceGoalRecentActivitiesProps = {
  activities: FinanceGoalActivityVm[];
  onDelete?: (activityId: string) => void;
  className?: string;
};

export function FinanceGoalRecentActivities({
  activities,
  onDelete,
  className,
}: FinanceGoalRecentActivitiesProps) {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const pendingActivity = activities.find((activity) => activity.id === pendingDeleteId) ?? null;

  return (
    <div className={cn('flex min-h-0 flex-1 flex-col mt-6 overflow-hidden', className)}>
      <p className={cn('shrink-0 uppercase tracking-wider', typeClass.overline, typeToneClass.muted60)}>
        Recent activity
      </p>

      {activities.length === 0 ? (
        <p className={cn('mt-2', typeClass.micro, typeToneClass.muted60)}>No activity recorded yet.</p>
      ) : (
        <ul className="scrollbar-none mt-2 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-0.5">
          {activities.map((activity) => {
            const positive = activity.amount >= 0;

            return (
              <li
                key={activity.id}
                className="flex items-center justify-between gap-3 border-b border-layer2-half pb-2 last:border-b-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className={cn('truncate', typeClass.micro, typeToneClass.default)}>{activity.label}</p>
                  <p className={cn('mt-0.5 tabular-nums', typeClass.micro, typeToneClass.muted60)}>
                    {activity.date}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <p
                    className={cn(
                      'tabular-nums',
                      typeClass.caption,
                      positive ? typeToneClass.positive : typeToneClass.negative,
                    )}
                  >
                    {formatWalletAmount(activity.amount, { signed: true })}
                  </p>
                  {activity.canDelete && onDelete ? (
                    <button
                      type="button"
                      aria-label={`Delete ${activity.label}`}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-text/50 transition hover:bg-red/10 hover:text-red"
                      onClick={() => setPendingDeleteId(activity.id)}
                    >
                      <MdDelete className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <NativeDialog open={pendingDeleteId != null} onClose={() => setPendingDeleteId(null)}>
        <form
          method="dialog"
          className="flex flex-col gap-4 p-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (!pendingDeleteId || !onDelete) return;
            onDelete(pendingDeleteId);
            setPendingDeleteId(null);
          }}
        >
          <div>
            <p className={cn(typeClass.title, typeToneClass.default)}>Delete contribution</p>
            <p className={cn('mt-2', typeClass.body, typeToneClass.muted60)}>
              {pendingActivity
                ? `Remove ${formatWalletAmount(pendingActivity.amount)} from "${pendingActivity.label}"? The financial transaction will also be reversed.`
                : 'The financial transaction will also be reversed.'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="destructive" size="sm" className="flex-1">
              Delete
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={() => setPendingDeleteId(null)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </NativeDialog>
    </div>
  );
}
