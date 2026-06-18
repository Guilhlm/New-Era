'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/cn';
import { CreateEntityDialog } from '@/components/ui/create-entity-dialog';
import { SegmentedControl, SegmentedControlItem } from '@/components/ui/segmented-control';
import { typeClass, typeToneClass } from '@/lib/typography';
import type { CreditCardBrand, CreditCardColorOption, CreditCardCreateInput, CreditCardVm } from '@/components/monthly-expenses/monthly-expenses-credit-cards.types';
import { walletDialogFieldClass, walletDialogSegmentClass, walletDialogSegmentItemClass, walletDialogSelectClass } from '@/components/wallet/wallet-dialog-layout';

const INPUT_CLASS = cn('w-full placeholder:text-text/40 disabled:opacity-60', walletDialogSelectClass);

export const CREDIT_CARD_COLOR_OPTIONS: CreditCardColorOption[] = [
  { id: 'blue', label: 'Blue', color: '#1e3a8a' },
  { id: 'salmon', label: 'Salmon', color: '#c45c4a' },
  { id: 'black', label: 'Black', color: '#0a0a0a' },
  { id: 'red', label: 'Red', color: '#8b0838' },
  { id: 'green', label: 'Green', color: '#14532d' },
  { id: 'gold', label: 'Gold', color: '#b45309' },
  { id: 'purple', label: 'Purple', color: '#4c1d95' },
  { id: 'pink', label: 'Pink', color: '#be185d' },
];

type CreditCardFormProps = {
  mode: 'create' | 'edit';
  initialCard?: CreditCardVm | null;
  saving?: boolean;
  onSubmit: (values: CreditCardCreateInput) => void;
  onClose: () => void;
};

function CreditCardForm({ mode, initialCard, saving = false, onSubmit, onClose }: CreditCardFormProps) {
  const [holder, setHolder] = useState('');
  const [lastFour, setLastFour] = useState('');
  const [limit, setLimit] = useState('');
  const [used, setUsed] = useState('');
  const [brand, setBrand] = useState<CreditCardBrand>('mastercard');
  const [colorId, setColorId] = useState(CREDIT_CARD_COLOR_OPTIONS[0].id);

  useEffect(() => {
    if (!initialCard) {
      setHolder('');
      setLastFour('');
      setLimit('');
      setUsed('');
      setBrand('mastercard');
      setColorId(CREDIT_CARD_COLOR_OPTIONS[0].id);
      return;
    }
    const matchingColor =
      CREDIT_CARD_COLOR_OPTIONS.find((option) => option.color === initialCard.color) ??
      CREDIT_CARD_COLOR_OPTIONS[0];
    setHolder(initialCard.holder);
    setLastFour(initialCard.lastFour);
    setLimit(String(initialCard.limit));
    setUsed(String(initialCard.used));
    setBrand(initialCard.brand);
    setColorId(matchingColor.id);
  }, [initialCard]);

  const limitNumber = Number(limit.replace(',', '.'));
  const usedNumber = used.trim() ? Number(used.replace(',', '.')) : 0;
  const colorOption = CREDIT_CARD_COLOR_OPTIONS.find((option) => option.id === colorId) ?? CREDIT_CARD_COLOR_OPTIONS[0];

  const canSubmit =
    holder.trim().length > 0 &&
    /^\d{4}$/.test(lastFour) &&
    Number.isFinite(limitNumber) &&
    limitNumber > 0 &&
    Number.isFinite(usedNumber) &&
    usedNumber >= 0 &&
    usedNumber <= limitNumber;

  return (
    <form
      method="dialog"
      className="flex flex-col gap-4 p-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (!canSubmit) return;
        onSubmit({
          holder: holder.trim().toUpperCase(),
          lastFour,
          limit: limitNumber,
          used: usedNumber,
          brand,
          color: colorOption.color,
        });
      }}
    >
      <div>
        <p className={cn(typeClass.title, typeToneClass.default)}>
          {mode === 'create' ? 'Add Card' : 'Edit card'}
        </p>
        <p className={cn('mt-1', typeClass.body, typeToneClass.muted60)}>
          Add a card to track its limit and monthly usage.
        </p>
      </div>

      <label className={walletDialogFieldClass}>
        <span className={cn(typeClass.caption, typeToneClass.muted60)}>Cardholder</span>
        <input
          type="text"
          autoFocus
          disabled={saving}
          value={holder}
          placeholder="Name as on card"
          className={INPUT_CLASS}
          onChange={(event) => setHolder(event.target.value)}
        />
      </label>

      <label className={walletDialogFieldClass}>
        <span className={cn(typeClass.caption, typeToneClass.muted60)}>Last 4 digits</span>
        <input
          type="text"
          inputMode="numeric"
          maxLength={4}
          disabled={saving}
          value={lastFour}
          placeholder="4444"
          className={cn(INPUT_CLASS, 'tabular-nums tracking-widest')}
          onChange={(event) => setLastFour(event.target.value.replace(/\D/g, '').slice(0, 4))}
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className={walletDialogFieldClass}>
          <span className={cn(typeClass.caption, typeToneClass.muted60)}>Limit</span>
          <input
            type="text"
            inputMode="decimal"
            disabled={saving}
            value={limit}
            placeholder="13900"
            className={cn(INPUT_CLASS, 'tabular-nums')}
            onChange={(event) => setLimit(event.target.value.replace(/[^\d.,]/g, ''))}
          />
        </label>
        <label className={walletDialogFieldClass}>
          <span className={cn(typeClass.caption, typeToneClass.muted60)}>Used</span>
          <input
            type="text"
            inputMode="decimal"
            disabled={saving}
            value={used}
            placeholder="0"
            className={cn(INPUT_CLASS, 'tabular-nums')}
            onChange={(event) => setUsed(event.target.value.replace(/[^\d.,]/g, ''))}
          />
        </label>
      </div>

      <div className={walletDialogFieldClass}>
        <span className={cn(typeClass.caption, typeToneClass.muted60)}>Brand</span>
        <SegmentedControl variant="soft" className={walletDialogSegmentClass}>
          <SegmentedControlItem
            active={brand === 'mastercard'}
            className={cn(walletDialogSegmentItemClass, typeClass.micro)}
            onClick={() => setBrand('mastercard')}
          >
            Mastercard
          </SegmentedControlItem>
          <SegmentedControlItem
            active={brand === 'visa'}
            className={cn(walletDialogSegmentItemClass, typeClass.micro)}
            onClick={() => setBrand('visa')}
          >
            Visa
          </SegmentedControlItem>
        </SegmentedControl>
      </div>

      <div className="flex flex-col gap-2">
        <span className={cn(typeClass.caption, typeToneClass.muted60)}>Card color</span>
        <div className="grid grid-cols-4 gap-2">
          {CREDIT_CARD_COLOR_OPTIONS.map((option) => {
            const selected = option.id === colorId;
            return (
              <button
                key={option.id}
                type="button"
                disabled={saving}
                aria-label={option.label}
                aria-pressed={selected}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-lg border px-2 py-2 transition',
                  selected ? 'border-red/60 bg-layer2-half' : 'border-grey/50 bg-layer2/40 hover:bg-layer2-half/60',
                )}
                onClick={() => setColorId(option.id)}
              >
                <span
                  className="h-8 w-full rounded-md ring-1 ring-grey/40"
                  style={{ backgroundColor: option.color }}
                  aria-hidden
                />
                <span className={cn('truncate w-full text-center', typeClass.micro, typeToneClass.default)}>
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" variant="primary" size="sm" disabled={saving || !canSubmit} className="flex-1">
          {saving ? 'Saving…' : mode === 'create' ? 'Add Card' : 'Save card'}
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

type MonthlyExpensesCreditCardDialogProps = {
  open: boolean;
  mode?: 'create' | 'edit';
  initialCard?: CreditCardVm | null;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (values: CreditCardCreateInput) => void;
};

export function MonthlyExpensesCreditCardDialog({
  open,
  mode = 'create',
  initialCard = null,
  saving = false,
  onClose,
  onSubmit,
}: MonthlyExpensesCreditCardDialogProps) {
  return (
    <CreateEntityDialog
      open={open}
      onClose={onClose}
      formKey={`${mode}-credit-card-${initialCard?.id ?? 'new'}`}
    >
      <CreditCardForm
        mode={mode}
        initialCard={initialCard}
        saving={saving}
        onSubmit={onSubmit}
        onClose={onClose}
      />
    </CreateEntityDialog>
  );
}
