'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ColorPicker, DEFAULT_PICKER_COLOR } from '@/components/ui/color-picker';
import { cn } from '@/components/ui/cn';
import { CreateEntityDialog } from '@/components/ui/create-entity-dialog';
import { SegmentedControl, SegmentedControlItem } from '@/components/ui/segmented-control';
import { typeClass, typeToneClass } from '@/lib/typography';
import type { CreditCardBrand, CreditCardCreateInput, CreditCardVm } from '@/components/monthly-expenses/monthly-expenses-credit-cards.types';
import { CreditCardDecor } from '@/components/monthly-expenses/credit-card-decor';
import {
  creditCardBackgroundStyle,
  creditCardTextTone,
  isLightCardColor,
} from '@/components/monthly-expenses/credit-card-visual';
import { walletDialogFieldClass, walletDialogSegmentClass, walletDialogSegmentItemClass, walletDialogSelectClass } from '@/components/wallet/wallet-dialog-layout';
import { normalizeHex } from '@/utils/color';

const INPUT_CLASS = cn('w-full placeholder:text-text/40 disabled:opacity-60', walletDialogSelectClass);
const SECONDARY_BUTTON_CLASS = cn('bg-layer2 text-text hover:bg-layer2-half');

function CardColorPreview({
  color,
  brand,
  holder,
  lastFour,
}: {
  color: string;
  brand: CreditCardBrand;
  lastFour: string;
  holder: string;
}) {
  const tone = creditCardTextTone(color);
  const light = isLightCardColor(color);
  const displayHolder = holder.trim() || 'SEU NOME';
  const displayDigits = /^\d{4}$/.test(lastFour) ? lastFour : '••••';

  return (
    <div
      className="relative h-[4.5rem] overflow-hidden rounded-xl shadow-[0_8px_20px_-12px_rgba(0,0,0,0.5)]"
      style={creditCardBackgroundStyle(color)}
      aria-hidden
    >
      <CreditCardDecor color={color} light={light} compact />
      <div className={cn('relative z-10 flex h-full flex-col justify-between px-4 py-3', tone.primary)}>
        <div className="flex items-start justify-between gap-2">
          <div
            className={cn(
              'h-4 w-6 shrink-0 rounded-[3px] bg-gradient-to-br shadow-sm ring-1',
              tone.chipLine,
              tone.chipRing,
            )}
          />
          {brand === 'mastercard' ? (
            <div className="flex items-center">
              <span className="h-3 w-3 rounded-full bg-[#eb001b]" />
              <span className="-ml-1.5 h-3 w-3 rounded-full bg-[#f79e1b]" />
            </div>
          ) : (
            <span className={cn(typeClass.micro, 'tracking-[0.18em]', light ? 'text-slate-900/80' : 'text-white/88')}>
              VISA
            </span>
          )}
        </div>
        <div className="flex items-end justify-between gap-2">
          <p className={cn('truncate uppercase tracking-[0.12em]', typeClass.micro, tone.muted)}>
            {displayHolder}
          </p>
          <p className={cn('shrink-0 tabular-nums tracking-[0.14em]', typeClass.micro, tone.secondary)}>
            •••• {displayDigits}
          </p>
        </div>
      </div>
    </div>
  );
}

type CreditCardFormProps = {
  mode: 'create' | 'edit';
  initialCard?: CreditCardVm | null;
  saving?: boolean;
  onSubmit: (values: CreditCardCreateInput) => void | Promise<void>;
  onClose: () => void;
};

function CreditCardForm({ mode, initialCard, saving = false, onSubmit, onClose }: CreditCardFormProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [holder, setHolder] = useState(initialCard?.holder ?? '');
  const [lastFour, setLastFour] = useState(initialCard?.lastFour ?? '');
  const [limit, setLimit] = useState(initialCard ? String(initialCard.limit) : '');
  const [used, setUsed] = useState(initialCard ? String(initialCard.used) : '');
  const [dueDay, setDueDay] = useState(String(initialCard?.dueDay ?? 10));
  const [brand, setBrand] = useState<CreditCardBrand>(initialCard?.brand ?? 'mastercard');
  const [color, setColor] = useState(initialCard?.color ?? DEFAULT_PICKER_COLOR);

  const limitNumber = Number(limit.replace(',', '.'));
  const usedNumber = used.trim() ? Number(used.replace(',', '.')) : 0;
  const dueDayNumber = Number(dueDay);
  const normalizedColor = normalizeHex(color);

  const canContinueStep1 =
    holder.trim().length > 0 &&
    /^\d{4}$/.test(lastFour) &&
    Number.isFinite(limitNumber) &&
    limitNumber > 0 &&
    Number.isFinite(usedNumber) &&
    usedNumber >= 0 &&
    usedNumber <= limitNumber &&
    Number.isInteger(dueDayNumber) &&
    dueDayNumber >= 1 &&
    dueDayNumber <= 28;

  async function submitCard() {
    if (!canContinueStep1 || saving) return;
    await onSubmit({
      holder: holder.trim().toUpperCase(),
      lastFour,
      limit: limitNumber,
      used: usedNumber,
      dueDay: dueDayNumber,
      brand,
      color,
    });
  }

  return (
    <form
      method="dialog"
      className="flex flex-col gap-4 p-5"
      onSubmit={async (event) => {
        event.preventDefault();
        if (step === 1) {
          if (!canContinueStep1) return;
          setStep(2);
          return;
        }
        await submitCard();
      }}
    >
      <div>
        <p className={cn('uppercase tracking-[0.14em]', typeClass.micro, typeToneClass.muted60)}>
          Step {step} of 2
        </p>
        <p className={cn('mt-1', typeClass.title, typeToneClass.default)}>
          {step === 1
            ? mode === 'create'
              ? 'Add Card'
              : 'Edit card'
            : 'Choose color'}
        </p>
        <p className={cn('mt-1', typeClass.body, typeToneClass.muted60)}>
          {step === 1
            ? 'Add a card to track its limit and monthly usage.'
            : 'Pick a color and preview how the card will look.'}
        </p>
      </div>

      {step === 1 ? (
        <>
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

          <label className={walletDialogFieldClass}>
            <span className={cn(typeClass.caption, typeToneClass.muted60)}>Invoice due day</span>
            <input
              type="text"
              inputMode="numeric"
              disabled={saving}
              value={dueDay}
              placeholder="10"
              className={cn(INPUT_CLASS, 'tabular-nums')}
              onChange={(event) => setDueDay(event.target.value.replace(/\D/g, '').slice(0, 2))}
            />
            <span className={cn(typeClass.micro, typeToneClass.muted60)}>
              Use days 1-28 to keep invoices valid every month.
            </span>
          </label>
        </>
      ) : (
        <div className="flex w-full flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className={cn(typeClass.caption, typeToneClass.muted60)}>Card color</span>
            <span className={cn('shrink-0 uppercase tabular-nums tracking-wider', typeClass.micro, typeToneClass.muted60)}>
              {normalizedColor ?? DEFAULT_PICKER_COLOR}
            </span>
          </div>

          <CardColorPreview color={color} brand={brand} holder={holder} lastFour={lastFour} />

          <ColorPicker value={color} onChange={setColor} disabled={saving} />
        </div>
      )}

      <div className="flex items-center gap-2">
        {step === 2 ? (
          <>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={saving}
              className="flex-1"
            >
              {saving ? 'Saving…' : mode === 'create' ? 'Add Card' : 'Save card'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={saving}
              className="shrink-0 px-5"
              onClick={() => setStep(1)}
            >
              Back
            </Button>
          </>
        ) : (
          <>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={saving || !canContinueStep1}
              className="flex-1"
            >
              Next
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={saving}
              className={cn(SECONDARY_BUTTON_CLASS, 'flex-1')}
              onClick={onClose}
            >
              Cancel
            </Button>
          </>
        )}
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
  onSubmit: (values: CreditCardCreateInput) => void | Promise<void>;
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
      size="wide"
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
