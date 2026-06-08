'use client';

import { cn } from '@/components/ui/cn';
import type { HealthVitalField, HealthVitalRow } from '@/types/body-metrics';

type HealthVitalRowProps = {
  data: {
    row: HealthVitalRow;
    editing: boolean;
  };
  ui: {
    disabled: boolean;
  };
  actions: {
    onChange: (field: HealthVitalField, value: string) => void;
  };
};

const inputClass =
  'mt-2 w-full rounded-md bg-layer2 px-3 py-2 text-base font-semibold text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red/60';

export function HealthVitalRow({ data, ui, actions }: HealthVitalRowProps) {
  const { row, editing } = data;

  return (
    <div className="rounded-xl bg-layer2-half px-5 py-4">
      <p className="text-xs font-medium uppercase tracking-wide text-text/60">{row.label}</p>

      {editing ? (
        <input
          inputMode={row.inputMode === 'numeric' ? 'numeric' : 'decimal'}
          autoComplete="off"
          aria-label={row.label}
          disabled={ui.disabled}
          className={cn(inputClass, ui.disabled ? 'opacity-60' : '')}
          value={row.draft}
          placeholder={row.placeholder}
          onChange={(event) => actions.onChange(row.field, event.target.value)}
        />
      ) : (
        <p className="mt-2 text-base font-semibold text-text">{row.valueLabel}</p>
      )}
    </div>
  );
}
