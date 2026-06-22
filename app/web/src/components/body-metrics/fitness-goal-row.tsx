'use client';

import { LabelValueRow } from '@/components/ui/label-value-row';
import type { GoalRowVm } from '@/hooks/use-fitness-macro-goal';

type FitnessGoalRowProps = {
  data: {
    row: GoalRowVm;
    editing: boolean;
  };
  ui: {
    disabled: boolean;
  };
  actions: {
    onWeightGoalChange: (value: string) => void;
    onCaloriesChange: (value: string) => void;
  };
};

export function FitnessGoalRow({ data, ui, actions }: FitnessGoalRowProps) {
  const { row, editing } = data;

  return (
    <LabelValueRow
      variant="plain"
      label={row.label}
      valueLabel={row.valueLabel}
      draft={row.draft}
      editing={editing}
      disabled={ui.disabled}
      placeholder={row.key === 'weight' ? '0 Kg' : '0 kcal'}
      inputMode={row.key === 'weight' ? 'decimal' : 'numeric'}
      onChange={(value) =>
        row.key === 'weight' ? actions.onWeightGoalChange(value) : actions.onCaloriesChange(value)
      }
    />
  );
}
