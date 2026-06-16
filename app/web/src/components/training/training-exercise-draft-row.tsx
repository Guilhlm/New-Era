'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';
import type { TrainingExerciseDraftVm } from '@/types/training';

type TrainingExerciseDraftRowProps = {
  data: TrainingExerciseDraftVm;
  actions: {
    onChangeName: (value: string) => void;
    onChangeEquipment: (value: string) => void;
    onChangeWeight: (value: number | null) => void;
    onChangeSeries: (value: number | null) => void;
    onChangeRepsMin: (value: number | null) => void;
    onChangeRepsMax: (value: number | null) => void;
    onConfirm: () => void;
    onCancel: () => void;
  };
  ui?: {
    disabled?: boolean;
    saving?: boolean;
  };
};

function parseOptionalNumber(value: string) {
  if (value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function TrainingExerciseDraftRow({ data, actions, ui }: TrainingExerciseDraftRowProps) {
  const blocked = ui?.disabled || ui?.saving;

  return (
    <div className="rounded-xl bg-layer2-half px-4 py-3">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <input
          type="text"
          placeholder="Exercise name"
          disabled={blocked}
          value={data.name}
          className={cn('rounded-md bg-layer2 px-3 py-2 text-text outline-none focus-visible:ring-2 focus-visible:ring-red/60', typeClass.body)}
          onChange={(event) => actions.onChangeName(event.target.value)}
        />
        <input
          type="text"
          placeholder="Equipment (Bar, Cable…)"
          disabled={blocked}
          value={data.equipment ?? ''}
          className={cn('rounded-md bg-layer2 px-3 py-2 text-text outline-none focus-visible:ring-2 focus-visible:ring-red/60', typeClass.body)}
          onChange={(event) => actions.onChangeEquipment(event.target.value)}
        />
        <input
          type="text"
          inputMode="decimal"
          placeholder="Weight (kg)"
          disabled={blocked}
          value={data.weightKg ?? ''}
          className={cn('rounded-md bg-layer2 px-3 py-2 text-text outline-none focus-visible:ring-2 focus-visible:ring-red/60', typeClass.body)}
          onChange={(event) => actions.onChangeWeight(parseOptionalNumber(event.target.value))}
        />
        <input
          type="text"
          inputMode="numeric"
          placeholder="Series"
          disabled={blocked}
          value={data.series ?? ''}
          className={cn('rounded-md bg-layer2 px-3 py-2 text-text outline-none focus-visible:ring-2 focus-visible:ring-red/60', typeClass.body)}
          onChange={(event) => actions.onChangeSeries(parseOptionalNumber(event.target.value))}
        />
        <input
          type="text"
          inputMode="numeric"
          placeholder="Reps min"
          disabled={blocked}
          value={data.repsMin ?? ''}
          className={cn('rounded-md bg-layer2 px-3 py-2 text-text outline-none focus-visible:ring-2 focus-visible:ring-red/60', typeClass.body)}
          onChange={(event) => actions.onChangeRepsMin(parseOptionalNumber(event.target.value))}
        />
        <input
          type="text"
          inputMode="numeric"
          placeholder="Reps max"
          disabled={blocked}
          value={data.repsMax ?? ''}
          className={cn('rounded-md bg-layer2 px-3 py-2 text-text outline-none focus-visible:ring-2 focus-visible:ring-red/60', typeClass.body)}
          onChange={(event) => actions.onChangeRepsMax(parseOptionalNumber(event.target.value))}
        />
      </div>

      <div className="mt-3 flex gap-2">
        <Button
          type="button"
          variant="primary"
          size="sm"
          disabled={blocked || !data.name.trim()}
          onClick={actions.onConfirm}
        >
          {ui?.saving ? 'Saving…' : 'Save exercise'}
        </Button>
        <Button
          type="button"
          variant="primary"
          size="sm"
          disabled={blocked}
          className={cn('bg-layer2 text-text hover:bg-layer2-half')}
          onClick={actions.onCancel}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
