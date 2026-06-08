'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';
import { EditModeFooterButton } from '@/components/ui/edit-mode-footer-button';
import { DietWaterGlassGrid } from '@/components/diet/diet-water-glass-grid';
import { normalizeWaterTotalDraft } from '@/utils/water-intake';
import { MdEdit } from 'react-icons/md';

type DietWaterIntakeCardProps = {
  data: {
    title: string;
    consumedLabel: string;
    targetLabel: string;
    glassCount: number;
    filledCount: number;
    editing: boolean;
    dirty: boolean;
    draft: string;
  };
  actions: {
    onGlassClick: (index: number) => void;
    onStartEdit: () => void;
    onSaveEdit: () => void;
    onCancelEdit: () => void;
    onWaterTotalChange: (value: string) => void;
  };
  ui?: {
    loading?: boolean;
    saving?: boolean;
    disabled?: boolean;
  };
  className?: string;
};

export function DietWaterIntakeCard({ data, actions, ui, className }: DietWaterIntakeCardProps) {
  const blocked = ui?.disabled || ui?.loading || ui?.saving;

  return (
    <Card className={cn('flex min-h-0 flex-col p-5 lg:p-6', className)}>
      <div className="flex items-center gap-3">
        <p className="shrink-0 text-lg font-semibold text-text">{data.title}</p>

        <p className="ml-auto min-w-0 truncate text-sm text-text/70">
          Consumed{' '}
          <span className="font-semibold text-red">{data.consumedLabel}</span>
          {' / '}
          {data.targetLabel}
        </p>

        {!data.editing ? (
          <button
            type="button"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-layer2-half text-text/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red/60"
            aria-label="Editar meta de água"
            disabled={blocked}
            onClick={actions.onStartEdit}
          >
            <MdEdit className="h-5 w-5" aria-hidden />
          </button>
        ) : null}
      </div>

      {data.editing ? (
        <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4">
          <label className="block rounded-xl bg-layer2-half px-4 py-3">
            <span className="block text-xs text-text/55">Meta (L) · copos de 300ml</span>
            <input
              type="text"
              inputMode="decimal"
              autoFocus
              value={data.draft}
              disabled={blocked}
              className="mt-1 w-full bg-transparent text-sm font-semibold text-text outline-none"
              onChange={(event) => actions.onWaterTotalChange(event.target.value)}
            />
          </label>

          <EditModeFooterButton
            dirty={data.dirty}
            saving={ui?.saving}
            disabled={blocked}
            saveDisabled={!Number(normalizeWaterTotalDraft(data.draft))}
            className="mt-auto"
            onSave={actions.onSaveEdit}
            onCancel={actions.onCancelEdit}
          />
        </div>
      ) : (
        <div className="mt-4 min-h-0 flex-1">
          {ui?.loading ? (
            <p className="text-sm text-text/60">Loading…</p>
          ) : (
            <DietWaterGlassGrid
              data={{ glassCount: data.glassCount, filledCount: data.filledCount }}
              actions={{ onGlassClick: actions.onGlassClick }}
              ui={{ disabled: blocked }}
            />
          )}
        </div>
      )}
    </Card>
  );
}
