'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';
import type { GoalRowVm } from '@/hooks/use-fitness-macro-goal';
import { FitnessGoalRow } from '@/components/body-metrics/fitness-goal-row';
import { MdCheck, MdEdit } from 'react-icons/md';

type FitnessGoalsCardProps = {
  data: {
    title: string;
    rows: GoalRowVm[];
    weightProgress: number;
    editing: boolean;
    loading: boolean;
    saving: boolean;
    dirty: {
      weightGoal: boolean;
      calories: boolean;
    };
  };
  actions: {
    onToggleEdit: () => void;
    onWeightGoalChange: (value: string) => void;
    onCaloriesChange: (value: string) => void;
  };
  className?: string;
};

export function FitnessGoalsCard({ data, actions, className }: FitnessGoalsCardProps) {
  const blocked = data.loading || data.saving;
  const hasDirty = data.dirty.weightGoal || data.dirty.calories;

  return (
    <Card className={cn('flex h-full min-h-0 flex-col p-5 lg:p-6', className)}>
      <div className="flex items-start gap-3">
        <p className={cn(typeClass.title, typeToneClass.default)}>{data.title}</p>

        <button
          type="button"
          className={cn(
            'ml-auto inline-flex h-9 w-9 items-center justify-center rounded-full bg-layer2-half transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red/60 hover:bg-layer2 hover:text-text',
            data.editing ? (hasDirty ? 'text-red' : 'text-text/70') : 'text-text/70',
          )}
          aria-label={data.editing ? 'Save goals' : 'Edit goals'}
          disabled={blocked}
          onClick={actions.onToggleEdit}
        >
          {data.editing ? (
            <MdCheck className="h-5 w-5" aria-hidden />
          ) : (
            <MdEdit className="h-5 w-5" aria-hidden />
          )}
        </button>
      </div>

      <div className="scrollbar-none mt-4 min-h-0 flex-1 overflow-auto pr-1">
        <div className="grid grid-cols-1 gap-2.5">
          {data.loading ? (
            <div className={cn('rounded-xl bg-layer2-half px-5 py-4', typeClass.body, typeToneClass.muted60)}>Loading…</div>
          ) : (
            data.rows.map((row) => (
              <FitnessGoalRow
                key={row.key}
                data={{
                  row,
                  editing: data.editing,
                  weightProgress: data.weightProgress,
                }}
                ui={{ disabled: blocked }}
                actions={{
                  onWeightGoalChange: actions.onWeightGoalChange,
                  onCaloriesChange: actions.onCaloriesChange,
                }}
              />
            ))
          )}
        </div>
      </div>
    </Card>
  );
}
