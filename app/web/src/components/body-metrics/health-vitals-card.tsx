'use client';

import type { HealthVitalField, HealthVitalRow } from '@/types/body-metrics';
import { HealthVitalRow as HealthVitalRowItem } from '@/components/body-metrics/health-vital-row';
import { EditableSidebarListCard } from '@/components/ui/editable-sidebar-list-card';
import { HEALTH_VITAL_DEFS } from '@/types/body-metrics';

type HealthVitalsCardProps = {
  data: {
    title: string;
    rows: HealthVitalRow[];
    editing: boolean;
    loading: boolean;
    saving: boolean;
    hasDirty: boolean;
  };
  actions: {
    onToggleEdit: () => void;
    onChange: (field: HealthVitalField, value: string) => void;
  };
  className?: string;
};

export function HealthVitalsCard({ data, actions, className }: HealthVitalsCardProps) {
  const blocked = data.loading || data.saving;

  return (
    <EditableSidebarListCard
      title={data.title}
      rowCount={HEALTH_VITAL_DEFS.length}
      loading={data.loading}
      saving={data.saving}
      editing={data.editing}
      hasDirty={data.hasDirty}
      onToggleEdit={actions.onToggleEdit}
      footerLabels={{ edit: 'Edit Vitals', save: 'Save Vitals', done: 'Done', saving: 'Saving…' }}
      className={className}
    >
      {data.rows.map((row) => (
        <HealthVitalRowItem
          key={row.key}
          data={{ row, editing: data.editing }}
          ui={{ disabled: blocked }}
          actions={{ onChange: actions.onChange }}
        />
      ))}
    </EditableSidebarListCard>
  );
}
