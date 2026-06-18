'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/cn';
import {
  sidebarDayListFooterReserveClass,
  sidebarGridListClass,
} from '@/components/ui/sidebar-day-row';
import { typeClass, typeToneClass } from '@/lib/typography';
import type { GoalRowVm } from '@/hooks/use-fitness-macro-goal';
import { FitnessGoalRow } from '@/components/body-metrics/fitness-goal-row';

type FitnessGoalsCardProps = {
  data: {
    title: string;
    rows: GoalRowVm[];
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
  const goalsListClass = sidebarGridListClass(2, false);

  return (
    <Card className={cn('flex h-full min-h-0 flex-col overflow-hidden p-5 lg:p-6', className)}>
      <p className={cn('shrink-0 text-center', typeClass.title, typeToneClass.default)}>{data.title}</p>

      <div className={goalsListClass}>
        {data.loading ? (
          <div
            className={cn(
              'col-span-full flex h-full items-center justify-center rounded-[5px] bg-layer2-half px-3',
              typeClass.body,
              typeToneClass.muted60,
            )}
          >
            Loading…
          </div>
        ) : (
          data.rows.map((row) => (
            <FitnessGoalRow
              key={row.key}
              data={{
                row,
                editing: data.editing,
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

      <Button
        type="button"
        variant="primary"
        size="md"
        disabled={blocked}
        className={sidebarDayListFooterReserveClass}
        onClick={() => void actions.onToggleEdit()}
      >
        {data.saving ? 'Saving…' : data.editing ? (hasDirty ? 'Save Goals' : 'Done') : 'Edit Goals'}
      </Button>
    </Card>
  );
}
