'use client';

import { LabelValueRow } from '@/components/ui/label-value-row';
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

export function HealthVitalRow({ data, ui, actions }: HealthVitalRowProps) {
  const { row, editing } = data;

  return (
    <LabelValueRow
      variant="sidebar"
      label={row.label}
      valueLabel={row.valueLabel}
      draft={row.draft}
      editing={editing}
      disabled={ui.disabled}
      placeholder={row.placeholder}
      inputMode={row.inputMode === 'numeric' ? 'numeric' : 'decimal'}
      onChange={(value) => actions.onChange(row.field, value)}
    />
  );
}
