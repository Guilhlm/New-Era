'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/cn';
import { CreateEntityDialog } from '@/components/ui/create-entity-dialog';
import { typeClass, typeToneClass } from '@/lib/typography';
import {
  formatGlassVolumeLabel,
  glassCountFromWaterTotal,
  normalizeWaterTotalDraft,
  perGlassVolume,
  WATER_MAX_TOTAL_L,
} from '@/utils/water-intake';

type DietWaterGoalDialogProps = {
  open: boolean;
  draft: string;
  allDaysDraft: string;
  glassCount: number;
  dirty: boolean;
  saving?: boolean;
  disabled?: boolean;
  onClose: () => void;
  onSave: () => void;
  onDraftChange: (value: string) => void;
  onAllDaysDraftChange: (value: string) => void;
  onApplyToAllDays: () => void;
};

function WaterGoalForm({
  draft,
  allDaysDraft,
  glassCount,
  dirty,
  saving = false,
  disabled = false,
  onClose,
  onSave,
  onDraftChange,
  onAllDaysDraftChange,
  onApplyToAllDays,
}: Omit<DietWaterGoalDialogProps, 'open'>) {
  const blocked = disabled || saving;
  const validDraft = (() => {
    const parsed = Number(normalizeWaterTotalDraft(draft));
    return parsed > 0 && parsed <= WATER_MAX_TOTAL_L;
  })();
  const validAllDaysDraft = (() => {
    const parsed = Number(normalizeWaterTotalDraft(allDaysDraft));
    return parsed > 0 && parsed <= WATER_MAX_TOTAL_L;
  })();
  const draftTotal = Number(normalizeWaterTotalDraft(draft)) || 0;
  const draftPerGlass = perGlassVolume(draftTotal, glassCount);
  const glassVolumeLabel = formatGlassVolumeLabel(draftPerGlass);

  return (
    <form
      method="dialog"
      className="flex flex-col gap-4 p-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (validDraft && dirty) onSave();
      }}
    >
      <div>
        <p className={cn(typeClass.title, typeToneClass.default)}>Edit water goal</p>
        <p className={cn('mt-1', typeClass.body, typeToneClass.muted60)}>
          Set how much you want to drink each day (max {WATER_MAX_TOTAL_L}L).
        </p>
      </div>

      <label className={cn('flex flex-col gap-2', typeClass.body)}>
        <span className="text-text/60">Daily goal (L)</span>
        <input
          type="text"
          inputMode="decimal"
          autoFocus
          disabled={blocked}
          value={draft}
          placeholder="3,0"
          className="rounded-md bg-layer2 px-3 py-2 text-text outline-none placeholder:text-text/40 focus-visible:ring-2 focus-visible:ring-red/60"
          onChange={(event) => onDraftChange(event.target.value)}
        />
      </label>

      <label className={cn('flex flex-col gap-2', typeClass.body)}>
        <span className="text-text/60">Apply to all days (L)</span>
        <div className="flex items-center gap-2">
          <input
            type="text"
            inputMode="decimal"
            disabled={blocked}
            value={allDaysDraft}
            placeholder="3,0"
            className="min-w-0 flex-1 rounded-md bg-layer2 px-3 py-2 text-text outline-none placeholder:text-text/40 focus-visible:ring-2 focus-visible:ring-red/60"
            onChange={(event) => onAllDaysDraftChange(event.target.value)}
          />
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={blocked || !validAllDaysDraft}
            className="shrink-0 bg-layer2 text-text hover:bg-layer2-half"
            onClick={onApplyToAllDays}
          >
            Apply
          </Button>
        </div>
      </label>

      <p className={cn(typeClass.caption, typeToneClass.muted60)}>
        Equivalent to {glassCount} glasses of {glassVolumeLabel}.
      </p>

      <div className="flex items-center gap-2">
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={blocked || !validDraft || !dirty}
          className="flex-1"
        >
          {saving ? 'Saving…' : 'Save goal'}
        </Button>
        <Button
          type="button"
          variant="primary"
          size="sm"
          disabled={blocked}
          className={cn('bg-layer2 text-text hover:bg-layer2-half')}
          onClick={onClose}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function DietWaterGoalDialog({
  open,
  draft,
  allDaysDraft,
  glassCount,
  dirty,
  saving,
  disabled,
  onClose,
  onSave,
  onDraftChange,
  onAllDaysDraftChange,
  onApplyToAllDays,
}: DietWaterGoalDialogProps) {
  return (
    <CreateEntityDialog open={open} onClose={onClose} formKey={`water-goal-${draft}`}>
      <WaterGoalForm
        draft={draft}
        allDaysDraft={allDaysDraft}
        glassCount={glassCount}
        dirty={dirty}
        saving={saving}
        disabled={disabled}
        onClose={onClose}
        onSave={onSave}
        onDraftChange={onDraftChange}
        onAllDaysDraftChange={onAllDaysDraftChange}
        onApplyToAllDays={onApplyToAllDays}
      />
    </CreateEntityDialog>
  );
}
