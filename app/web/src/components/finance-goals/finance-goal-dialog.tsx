'use client';

import { useState } from 'react';
import { cn } from '@/components/ui/cn';
import { CreateEntityDialog } from '@/components/ui/create-entity-dialog';
import { DialogFormActions } from '@/components/ui/dialog-form-actions';
import { DialogFormField } from '@/components/ui/dialog-form-field';
import { dialogFormInputClass } from '@/components/ui/dialog-form-layout';
import { typeClass, typeToneClass } from '@/lib/typography';

const INPUT_CLASS = cn('w-full placeholder:text-text/40 disabled:opacity-60', dialogFormInputClass);

type GoalFormValues = {
  label: string;
  description: string;
  target: string;
  current: string;
  deadline: string;
  locked?: boolean;
};

type GoalFormProps = {
  mode: 'create' | 'edit';
  initial: GoalFormValues;
  saving?: boolean;
  onSubmit: (values: {
    label: string;
    description: string;
    target: number;
    current: number;
    deadline: string;
  }) => void;
  onClose: () => void;
};

function parseAmountInput(value: string) {
  const normalized = value.trim().replace(',', '.');
  if (!normalized || normalized === '-' || normalized === '+') return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function GoalForm({ mode, initial, saving = false, onSubmit, onClose }: GoalFormProps) {
  const [label, setLabel] = useState(initial.label);
  const [description, setDescription] = useState(initial.description);
  const [target, setTarget] = useState(initial.target);
  const [current, setCurrent] = useState(initial.current);
  const [deadline, setDeadline] = useState(initial.deadline);
  const nameLocked = Boolean(initial.locked);

  const targetNumber = parseAmountInput(target);
  const currentNumber = parseAmountInput(current) ?? 0;
  const canSubmit =
    label.trim().length > 0 &&
    description.trim().length > 0 &&
    deadline.trim().length > 0 &&
    targetNumber != null &&
    targetNumber > 0 &&
    currentNumber >= 0 &&
    currentNumber <= targetNumber;

  return (
    <form
      method="dialog"
      className="flex flex-col gap-4 p-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (!canSubmit || targetNumber == null) return;
        onSubmit({
          label: label.trim(),
          description: description.trim(),
          target: targetNumber,
          current: currentNumber,
          deadline: deadline.trim(),
        });
      }}
    >
      <div>
        <p className={cn(typeClass.title, typeToneClass.default)}>
          {mode === 'create' ? 'New goal' : 'Edit goal'}
        </p>
        <p className={cn('mt-1', typeClass.body, typeToneClass.muted60)}>
          {mode === 'create'
            ? 'Set the objective, target amount, and how much you have already saved.'
            : 'Update the details or progress of this goal.'}
        </p>
      </div>

      <DialogFormField
        label="Name"
        hint={nameLocked ? 'Fixed goal: the name cannot be changed.' : undefined}
      >
        <input
          type="text"
          autoFocus
          disabled={saving || nameLocked}
          value={label}
          placeholder="Emergency reserve…"
          className={INPUT_CLASS}
          onChange={(event) => setLabel(event.target.value)}
        />
      </DialogFormField>

      <DialogFormField label="Description">
        <input
          type="text"
          disabled={saving}
          value={description}
          placeholder="Financial safety…"
          className={INPUT_CLASS}
          onChange={(event) => setDescription(event.target.value)}
        />
      </DialogFormField>

      <div className="grid grid-cols-2 gap-3">
        <DialogFormField label="Target amount">
          <input
            type="text"
            inputMode="decimal"
            disabled={saving}
            value={target}
            placeholder="15000"
            className={cn(INPUT_CLASS, 'tabular-nums')}
            onChange={(event) => setTarget(event.target.value.replace(/[^\d.,]/g, ''))}
          />
        </DialogFormField>

        <DialogFormField label="Already saved">
          <input
            type="text"
            inputMode="decimal"
            disabled={saving}
            value={current}
            placeholder="0"
            className={cn(INPUT_CLASS, 'tabular-nums')}
            onChange={(event) => setCurrent(event.target.value.replace(/[^\d.,]/g, ''))}
          />
        </DialogFormField>
      </div>

      <DialogFormField label="Deadline">
        <input
          type="text"
          disabled={saving}
          value={deadline}
          placeholder="Dec 2026"
          className={INPUT_CLASS}
          onChange={(event) => setDeadline(event.target.value)}
        />
      </DialogFormField>

      {targetNumber != null && currentNumber > targetNumber ? (
        <p className={cn(typeClass.micro, 'text-red')}>The saved amount cannot exceed the goal.</p>
      ) : null}

      <DialogFormActions
        submitLabel={saving ? 'Saving…' : mode === 'create' ? 'Create goal' : 'Save changes'}
        saving={saving}
        disabled={!canSubmit}
        onCancel={onClose}
      />
    </form>
  );
}

type FinanceGoalDialogProps = {
  open: boolean;
  mode: 'create' | 'edit';
  initial: GoalFormValues;
  saving?: boolean;
  onSubmit: (values: {
    label: string;
    description: string;
    target: number;
    current: number;
    deadline: string;
  }) => void;
  onClose: () => void;
};

export function FinanceGoalDialog({
  open,
  mode,
  initial,
  saving = false,
  onSubmit,
  onClose,
}: FinanceGoalDialogProps) {
  return (
    <CreateEntityDialog open={open} onClose={onClose}>
      <GoalForm
        key={`${mode}-${initial.label}-${initial.target}`}
        mode={mode}
        initial={initial}
        saving={saving}
        onSubmit={onSubmit}
        onClose={onClose}
      />
    </CreateEntityDialog>
  );
}
