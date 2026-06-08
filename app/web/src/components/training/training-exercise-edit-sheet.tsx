'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/cn';
import { NativeDialog } from '@/components/ui/native-dialog';
import type { TrainingExerciseVm } from '@/types/training';

type EditExerciseFormProps = {
  item: TrainingExerciseVm;
  saving: boolean;
  onClose: () => void;
  onSave: (input: {
    name: string;
    equipment: string | null;
    weightKg: number | null;
    series: number | null;
    repsMin: number | null;
    repsMax: number | null;
  }) => void;
  onDelete: () => void;
};

function parseOptionalNumber(value: string) {
  if (value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function EditExerciseForm({ item, saving, onClose, onSave, onDelete }: EditExerciseFormProps) {
  const [name, setName] = useState(item.name);
  const [equipment, setEquipment] = useState(item.equipment ?? '');
  const [weightKg, setWeightKg] = useState(item.weightKg?.toString() ?? '');
  const [series, setSeries] = useState(item.series?.toString() ?? '');
  const [repsMin, setRepsMin] = useState(item.repsMin?.toString() ?? '');
  const [repsMax, setRepsMax] = useState(item.repsMax?.toString() ?? '');

  return (
    <form
      method="dialog"
      className="flex flex-col gap-4 p-5"
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) return;
        onSave({
          name: trimmed,
          equipment: equipment.trim() || null,
          weightKg: parseOptionalNumber(weightKg),
          series: parseOptionalNumber(series),
          repsMin: parseOptionalNumber(repsMin),
          repsMax: parseOptionalNumber(repsMax),
        });
      }}
    >
      <div>
        <p className="text-lg font-semibold text-text">Edit exercise</p>
        <p className="mt-1 text-sm text-text/60">{item.name}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm sm:col-span-2">
          <span className="text-text/60">Name</span>
          <input
            type="text"
            disabled={saving}
            value={name}
            className="rounded-md bg-layer2 px-3 py-2 text-text outline-none focus-visible:ring-2 focus-visible:ring-red/60"
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="text-text/60">Equipment</span>
          <input
            type="text"
            disabled={saving}
            value={equipment}
            className="rounded-md bg-layer2 px-3 py-2 text-text outline-none focus-visible:ring-2 focus-visible:ring-red/60"
            onChange={(event) => setEquipment(event.target.value)}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="text-text/60">Weight (kg)</span>
          <input
            type="text"
            inputMode="decimal"
            disabled={saving}
            value={weightKg}
            className="rounded-md bg-layer2 px-3 py-2 text-text outline-none focus-visible:ring-2 focus-visible:ring-red/60"
            onChange={(event) => setWeightKg(event.target.value)}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="text-text/60">Series</span>
          <input
            type="text"
            inputMode="numeric"
            disabled={saving}
            value={series}
            className="rounded-md bg-layer2 px-3 py-2 text-text outline-none focus-visible:ring-2 focus-visible:ring-red/60"
            onChange={(event) => setSeries(event.target.value)}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="text-text/60">Reps min</span>
          <input
            type="text"
            inputMode="numeric"
            disabled={saving}
            value={repsMin}
            className="rounded-md bg-layer2 px-3 py-2 text-text outline-none focus-visible:ring-2 focus-visible:ring-red/60"
            onChange={(event) => setRepsMin(event.target.value)}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="text-text/60">Reps max</span>
          <input
            type="text"
            inputMode="numeric"
            disabled={saving}
            value={repsMax}
            className="rounded-md bg-layer2 px-3 py-2 text-text outline-none focus-visible:ring-2 focus-visible:ring-red/60"
            onChange={(event) => setRepsMax(event.target.value)}
          />
        </label>
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" variant="primary" size="sm" disabled={saving || !name.trim()} className="flex-1">
          {saving ? 'Saving…' : 'Save'}
        </Button>
        <Button
          type="button"
          variant="primary"
          size="sm"
          disabled={saving}
          className="bg-layer2 text-text hover:bg-layer2-half"
          onClick={onClose}
        >
          Cancel
        </Button>
      </div>

      <Button
        type="button"
        variant="primary"
        size="sm"
        disabled={saving}
        className={cn('bg-red hover:bg-red/90')}
        onClick={onDelete}
      >
        Delete exercise
      </Button>
    </form>
  );
}

type TrainingExerciseEditSheetProps = {
  open: boolean;
  item: TrainingExerciseVm | null;
  saving: boolean;
  onClose: () => void;
  onSave: (input: {
    name: string;
    equipment: string | null;
    weightKg: number | null;
    series: number | null;
    repsMin: number | null;
    repsMax: number | null;
  }) => void;
  onDelete: () => void;
};

export function TrainingExerciseEditSheet({
  open,
  item,
  saving,
  onClose,
  onSave,
  onDelete,
}: TrainingExerciseEditSheetProps) {
  return (
    <NativeDialog open={open} onClose={onClose}>
      {open && item ? (
        <EditExerciseForm
          key={item.id}
          item={item}
          saving={saving}
          onClose={onClose}
          onSave={onSave}
          onDelete={onDelete}
        />
      ) : null}
    </NativeDialog>
  );
}
