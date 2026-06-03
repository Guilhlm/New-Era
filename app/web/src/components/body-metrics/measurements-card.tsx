'use client';

import type { FormEvent } from 'react';
import type { MeasurementRowVm } from '@/hooks/use-body-metrics-dashboard-state';
import { MeasurementRow } from '@/components/body-metrics/measurement-row';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';

type MeasurementsCardProps = {
  data: {
    title: string;
    rows: MeasurementRowVm[];
  };
  ui: {
    loading: boolean;
    saving: boolean;
    hasUnsavedChanges: boolean;
    inputBaseClass: string;
    savedFieldTextClass: string;
  };
  actions: {
    setMeasurementDraft: (field: string, value: string) => void;
    saveMeasurements: () => Promise<void>;
  };
  style?: React.CSSProperties;
  className?: string;
};

export function MeasurementsCard({ data, ui, actions, style, className }: MeasurementsCardProps) {
  const blocked = ui.loading || ui.saving;
  const saveDisabled = blocked || !ui.hasUnsavedChanges;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (saveDisabled) return;
    void actions.saveMeasurements();
  }

  return (
    <Card
      as="form"
      onSubmit={onSubmit}
      className={cn(
        'flex h-full min-h-0 flex-col overflow-hidden px-6 py-5 lg:px-8 lg:py-10',
        className,
      )}
      style={style}
    >
      <div className="ml-2.5 mt-0 mb-[22px] flex items-center justify-between gap-4">
        <p className="truncate text-lg font-semibold text-[color:var(--color-text-60)]">{data.title}</p>
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={saveDisabled}
          className="h-auto shrink-0 px-14 py-3 font-medium disabled:opacity-40"
        >
          {ui.saving ? 'Saving…' : 'Save Metrics'}
        </Button>
      </div>

      <div className="scrollbar-none mt-0 min-h-0 flex-1 overflow-auto">
        <div className="relative pl-7 lg:pl-9 pr-1">
          <div
            className="absolute bottom-0 left-[0.6875rem] top-0 w-px bg-layer2 lg:left-[1.125rem]"
            aria-hidden
          />

          <div className="divide-y divide-layer2">
            {data.rows.map((row) => (
              <MeasurementRow
                key={row.key}
                row={row}
                disabled={blocked}
                inputBaseClass={ui.inputBaseClass}
                savedFieldTextClass={ui.savedFieldTextClass}
                onChange={actions.setMeasurementDraft}
              />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
