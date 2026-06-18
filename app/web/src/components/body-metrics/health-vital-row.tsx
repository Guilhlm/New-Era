'use client';

import { cn } from '@/components/ui/cn';
import { sidebarDayRowClass } from '@/components/ui/sidebar-day-row';
import { typeClass, typeToneClass } from '@/lib/typography';
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
  'min-w-0 flex-1 bg-transparent text-right outline-none placeholder:text-text/40 focus-visible:ring-0';

export function HealthVitalRow({ data, ui, actions }: HealthVitalRowProps) {
  const { row, editing } = data;

  return (
    <div className={cn(sidebarDayRowClass(false), 'min-w-0')}>
      <span className={cn('min-w-0 truncate', typeClass.body, typeToneClass.muted60)}>{row.label}</span>

      {editing ? (
        <input
          inputMode={row.inputMode === 'numeric' ? 'numeric' : 'decimal'}
          autoComplete="off"
          aria-label={row.label}
          disabled={ui.disabled}
          className={cn(inputClass, typeClass.body, ui.disabled ? 'opacity-60' : 'text-text')}
          value={row.draft}
          placeholder={row.placeholder}
          onChange={(event) => actions.onChange(row.field, event.target.value)}
        />
      ) : (
        <span className={cn('shrink-0 truncate text-right', typeClass.body, typeToneClass.default)}>
          {row.valueLabel}
        </span>
      )}
    </div>
  );
}
