'use client';

import { cn } from '@/components/ui/cn';
import { typeClass } from '@/lib/typography';
import {
  formatAmountHint,
  formatSharesDraft,
  normalizeDecimalDraft,
  parseLocaleShares,
} from '@/utils/wallet-number-input';

type WalletNumericInputProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  hint?: boolean;
  variant?: 'amount' | 'shares';
  className?: string;
};

function formatSharesHint(value: string): string | null {
  const parsed = parseLocaleShares(value);
  if (parsed == null || value.trim().length < 2) return null;
  return formatSharesDraft(parsed);
}

export function WalletNumericInput({
  value,
  onChange,
  disabled,
  placeholder,
  hint = true,
  variant = 'amount',
  className,
}: WalletNumericInputProps) {
  const isShares = variant === 'shares';
  const hintLabel = hint ? (isShares ? formatSharesHint(value) : formatAmountHint(value)) : null;
  const resolvedPlaceholder = placeholder ?? (isShares ? '0,001' : '0,00');

  return (
    <div className="flex flex-col gap-1">
      <input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={value}
        disabled={disabled}
        placeholder={resolvedPlaceholder}
        className={cn(
          'min-h-11 rounded-md bg-layer2 px-4 py-2.5 tabular-nums text-text outline-none focus-visible:ring-2 focus-visible:ring-red/60',
          className,
        )}
        onChange={(event) => onChange(normalizeDecimalDraft(event.target.value))}
      />
      {hintLabel ? (
        <span className={cn(typeClass.caption, 'text-text/45')}>≈ {hintLabel}</span>
      ) : null}
    </div>
  );
}
