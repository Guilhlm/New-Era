'use client';

import type { HealthVitalField, HealthVitalRow } from '@/types/body-metrics';
import { HealthVitalRow as HealthVitalRowItem } from '@/components/body-metrics/health-vital-row';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';
import {
  sidebarDayListFooterReserveClass,
  sidebarGridListClass,
} from '@/components/ui/sidebar-day-row';
import { typeClass, typeToneClass } from '@/lib/typography';
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
  const vitalListClass = sidebarGridListClass(HEALTH_VITAL_DEFS.length);

  return (
    <Card className={cn('flex h-full min-h-0 flex-col overflow-hidden p-5 lg:p-6', className)}>
      <p className={cn('shrink-0 text-center', typeClass.title, typeToneClass.default)}>{data.title}</p>

      <div className={vitalListClass}>
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
            <HealthVitalRowItem
              key={row.key}
              data={{ row, editing: data.editing }}
              ui={{ disabled: blocked }}
              actions={{ onChange: actions.onChange }}
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
        {data.saving
          ? 'Saving…'
          : data.editing
            ? data.hasDirty
              ? 'Save Vitals'
              : 'Done'
            : 'Edit Vitals'}
      </Button>
    </Card>
  );
}
