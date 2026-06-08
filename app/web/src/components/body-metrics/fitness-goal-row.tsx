'use client';

import { cn } from '@/components/ui/cn';
import type { GoalRowVm } from '@/hooks/use-fitness-macro-goal';

type FitnessGoalRowProps = {
  data: {
    row: GoalRowVm;
    editing: boolean;
    weightProgress: number;
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
  'mt-2 w-full rounded-md bg-layer2 px-3 py-2 text-center text-base font-semibold text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red/60';

export function FitnessGoalRow({ data, ui, actions }: FitnessGoalRowProps) {
  const { row, editing, weightProgress } = data;
  const percent = Math.min(100, Math.max(0, weightProgress));

  return (
    <div className="rounded-xl bg-layer2-half px-5 py-4">
      <p className="text-xs font-medium uppercase tracking-wide text-text/60">{row.label}</p>

      {editing ? (
        <input
          inputMode={row.key === 'weight' ? 'decimal' : 'numeric'}
          autoComplete="off"
          aria-label={row.label}
          disabled={ui.disabled}
          className={cn(inputClass, ui.disabled ? 'opacity-60' : '')}
          value={row.draft}
          placeholder={row.key === 'weight' ? '0 Kg' : '0 kcal'}
          onChange={(e) =>
            row.key === 'weight'
              ? actions.onWeightGoalChange(e.target.value)
              : actions.onCaloriesChange(e.target.value)
          }
        />
      ) : (
        <p className="mt-2 text-base font-semibold text-text">{row.valueLabel}</p>
      )}

      {row.showProgress && !editing ? (
        <div className="mt-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-text/60">Progress</p>
            <p className="text-xs font-medium text-text/70">{percent}%</p>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-layer2">
            <div className="h-2 rounded-full bg-red" style={{ width: `${percent}%` }} aria-hidden />
          </div>
        </div>
      ) : null}
    </div>
  );
}
