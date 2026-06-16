'use client';

import type { HealthVitalField, HealthVitalRow } from '@/types/body-metrics';
import { HealthVitalRow as HealthVitalRowItem } from '@/components/body-metrics/health-vital-row';
import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';
import { MdCheck, MdEdit } from 'react-icons/md';

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
    <Card className={cn('flex h-full min-h-0 flex-col p-5 lg:p-6', className)}>
      <div className="flex items-start gap-3">
        <p className={cn(typeClass.title, typeToneClass.default)}>{data.title}</p>

        <button
          type="button"
          className={cn(
            'ml-auto inline-flex h-9 w-9 items-center justify-center rounded-full bg-layer2-half focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red/60',
            data.editing ? (data.hasDirty ? 'text-red' : 'text-text/70') : 'text-text/70',
          )}
          aria-label={data.editing ? 'Salvar vitals' : 'Editar vitals'}
          disabled={blocked}
          onClick={actions.onToggleEdit}
        >
          {data.editing ? (
            <MdCheck className="h-5 w-5" aria-hidden />
          ) : (
            <MdEdit className="h-5 w-5" aria-hidden />
          )}
        </button>
      </div>

      <div className="scrollbar-none mt-4 min-h-0 flex-1 overflow-auto pr-1">
        <div className="grid grid-cols-1 gap-2.5">
          {data.loading ? (
            <div className={cn('rounded-xl bg-layer2-half px-5 py-4', typeClass.body, typeToneClass.muted60)}>Carregando…</div>
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
      </div>
    </Card>
  );
}
