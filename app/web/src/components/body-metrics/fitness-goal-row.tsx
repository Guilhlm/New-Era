'use client';

import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';
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

const inputClass =
  'min-w-0 flex-1 bg-transparent text-right outline-none placeholder:text-text/40 focus-visible:ring-0';

export function FitnessGoalRow({ data, ui, actions }: FitnessGoalRowProps) {
  const { row, editing } = data;

  return (
    <div className="flex h-full min-h-0 items-center justify-between gap-2 overflow-hidden rounded-[5px] bg-layer2-half px-3 py-2">
      <span className={cn('min-w-0 truncate', typeClass.body, typeToneClass.muted60)}>{row.label}</span>

      {editing ? (
        <input
          inputMode={row.key === 'weight' ? 'decimal' : 'numeric'}
          autoComplete="off"
          aria-label={row.label}
          disabled={ui.disabled}
          className={cn(inputClass, typeClass.body, ui.disabled ? 'opacity-60' : 'text-text')}
          value={row.draft}
          placeholder={row.key === 'weight' ? '0 Kg' : '0 kcal'}
          onChange={(e) =>
            row.key === 'weight'
              ? actions.onWeightGoalChange(e.target.value)
              : actions.onCaloriesChange(e.target.value)
          }
        />
      ) : (
        <span className={cn('shrink-0 truncate text-right', typeClass.body, typeToneClass.default)}>
          {row.valueLabel}
        </span>
      )}
    </div>
  );
}
