'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/cn';
import { CreateEntityDialog } from '@/components/ui/create-entity-dialog';
import { typeClass, typeToneClass } from '@/lib/typography';
import { formatBrlAmount } from '@/utils/wallet';
import { walletDialogFieldClass, walletDialogSelectClass } from '@/components/wallet/wallet-dialog-layout';

const INPUT_CLASS = cn('w-full placeholder:text-text/40 disabled:opacity-60', walletDialogSelectClass);

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

      <label className={walletDialogFieldClass}>
        <span className={cn(typeClass.caption, typeToneClass.muted60)}>Name</span>
        <input
          type="text"
          autoFocus
          disabled={saving || nameLocked}
          value={name}
          placeholder="Food, Transport…"
          className={INPUT_CLASS}
          onChange={(event) => setName(event.target.value)}
        />
        {nameLocked ? (
          <span className={cn(typeClass.micro, typeToneClass.muted60)}>
            Fixed category: the name cannot be changed.
          </span>
        ) : null}
      </label>

      <label className={walletDialogFieldClass}>
        <span className={cn(typeClass.caption, typeToneClass.muted60)}>Monthly budget</span>
        <input
          type="text"
          inputMode="decimal"
          disabled={saving}
          value={budget}
          placeholder="1500"
          className={cn(INPUT_CLASS, 'tabular-nums')}
          onChange={(event) => setBudget(event.target.value.replace(/[^\d.,]/g, ''))}
        />
      </label>

      {mode === 'edit' && initial.spent != null ? (
        <label className={walletDialogFieldClass}>
          <span className={cn(typeClass.caption, typeToneClass.muted60)}>Spending adjustment</span>
          <input
            type="text"
            inputMode="decimal"
            disabled={saving}
            value={spentAdjustment}
            placeholder="50 or -20"
            className={cn(INPUT_CLASS, 'tabular-nums')}
            onChange={(event) => setSpentAdjustment(event.target.value.replace(/[^\d.,+-]/g, ''))}
          />
          <span className={cn(typeClass.micro, typeToneClass.muted60)}>
            Current spending: {formatBrlAmount(initial.spent)} · positive adds, negative removes
          </span>
        </label>
      ) : null}

      <div className="flex items-center gap-2">
        <Button type="submit" variant="primary" size="sm" disabled={saving || !canSubmit} className="flex-1">
          {saving ? 'Saving…' : mode === 'create' ? 'Create category' : 'Save changes'}
        </Button>
        <Button
          type="button"
          variant="primary"
          size="sm"
          disabled={saving}
          className={cn('bg-layer2 text-text hover:bg-layer2-half')}
          onClick={onClose}
        >
          Cancel
        </Button>
      </div>
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
