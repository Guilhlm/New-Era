'use client';

import { useState } from 'react';
import { cn } from '@/components/ui/cn';
import { CreateEntityDialog } from '@/components/ui/create-entity-dialog';
import { DialogFormActions } from '@/components/ui/dialog-form-actions';
import { DialogFormField } from '@/components/ui/dialog-form-field';
import { dialogFormInputClass } from '@/components/ui/dialog-form-layout';
import { typeClass, typeToneClass } from '@/lib/typography';
import { formatBrlAmount } from '@/utils/wallet';

const INPUT_CLASS = cn('w-full placeholder:text-text/40 disabled:opacity-60', dialogFormInputClass);

type CategoryFormValues = {
  name: string;
  budget: string;
  spent?: number;
  locked?: boolean;
};

type CategoryFormProps = {
  mode: 'create' | 'edit';
  initial: CategoryFormValues;
  saving?: boolean;
  onSubmit: (values: { name: string; budget: number; spentAdjustment?: number }) => void;
  onClose: () => void;
};

function parseAmountInput(value: string) {
  const normalized = value.trim().replace(',', '.');
  if (!normalized || normalized === '-' || normalized === '+') return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function CategoryForm({ mode, initial, saving = false, onSubmit, onClose }: CategoryFormProps) {
  const [name, setName] = useState(initial.name);
  const [budget, setBudget] = useState(initial.budget);
  const [spentAdjustment, setSpentAdjustment] = useState('');
  const nameLocked = Boolean(initial.locked);

  const budgetNumber = Number(budget.replace(',', '.'));
  const adjustmentNumber = parseAmountInput(spentAdjustment);
  const adjustmentValid = spentAdjustment.trim() === '' || adjustmentNumber != null;
  const canSubmit =
    name.trim().length > 0 && Number.isFinite(budgetNumber) && budgetNumber > 0 && adjustmentValid;

  return (
    <form
      method="dialog"
      className="flex flex-col gap-4 p-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (!canSubmit) return;
        onSubmit({
          name: name.trim(),
          budget: budgetNumber,
          spentAdjustment: mode === 'edit' ? (adjustmentNumber ?? 0) : undefined,
        });
      }}
    >
      <div>
        <p className={cn(typeClass.title, typeToneClass.default)}>
          {mode === 'create' ? 'New category' : 'Edit category'}
        </p>
        <p className={cn('mt-1', typeClass.body, typeToneClass.muted60)}>
          {mode === 'create'
            ? 'Set the name and monthly budget for this category.'
            : 'Update the budget or adjust spending recorded in this category.'}
        </p>
      </div>

      <DialogFormField
        label="Name"
        hint={nameLocked ? 'Fixed category: the name cannot be changed.' : undefined}
      >
        <input
          type="text"
          autoFocus
          disabled={saving || nameLocked}
          value={name}
          placeholder="Food, Transport…"
          className={INPUT_CLASS}
          onChange={(event) => setName(event.target.value)}
        />
      </DialogFormField>

      <DialogFormField label="Monthly budget">
        <input
          type="text"
          inputMode="decimal"
          disabled={saving}
          value={budget}
          placeholder="1500"
          className={cn(INPUT_CLASS, 'tabular-nums')}
          onChange={(event) => setBudget(event.target.value.replace(/[^\d.,]/g, ''))}
        />
      </DialogFormField>

      {mode === 'edit' && initial.spent != null ? (
        <DialogFormField
          label="Spending adjustment"
          hint={`Current spending: ${formatBrlAmount(initial.spent)} · positive adds, negative removes`}
        >
          <input
            type="text"
            inputMode="decimal"
            disabled={saving}
            value={spentAdjustment}
            placeholder="50 or -20"
            className={cn(INPUT_CLASS, 'tabular-nums')}
            onChange={(event) => setSpentAdjustment(event.target.value.replace(/[^\d.,+-]/g, ''))}
          />
        </DialogFormField>
      ) : null}

      <DialogFormActions
        submitLabel={saving ? 'Saving…' : mode === 'create' ? 'Create category' : 'Save changes'}
        saving={saving}
        disabled={!canSubmit}
        onCancel={onClose}
      />
    </form>
  );
}

type MonthlyExpensesCategoryDialogProps = {
  open: boolean;
  mode: 'create' | 'edit';
  initial: CategoryFormValues;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (values: { name: string; budget: number; spentAdjustment?: number }) => void;
};

export function MonthlyExpensesCategoryDialog({
  open,
  mode,
  initial,
  saving = false,
  onClose,
  onSubmit,
}: MonthlyExpensesCategoryDialogProps) {
  return (
    <CreateEntityDialog open={open} onClose={onClose} formKey={`category-${mode}-${initial.name}`}>
      <CategoryForm mode={mode} initial={initial} saving={saving} onSubmit={onSubmit} onClose={onClose} />
    </CreateEntityDialog>
  );
}
