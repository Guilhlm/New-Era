'use client';

import { EditableSidebarListCard } from '@/components/ui/editable-sidebar-list-card';
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

  return (
    <EditableSidebarListCard
      title={data.title}
      rowCount={2}
      alignWithStats={false}
      loading={data.loading}
      saving={data.saving}
      editing={data.editing}
      hasDirty={hasDirty}
      onToggleEdit={actions.onToggleEdit}
      footerLabels={{ edit: 'Edit Goals', save: 'Save Goals', done: 'Done', saving: 'Saving…' }}
      className={className}
    >
      {data.rows.map((row) => (
        <FitnessGoalRow
          key={row.key}
          data={{ row, editing: data.editing }}
          ui={{ disabled: blocked }}
          actions={{
            onWeightGoalChange: actions.onWeightGoalChange,
            onCaloriesChange: actions.onCaloriesChange,
          }}
        />
      ))}
    </EditableSidebarListCard>
  );
}
