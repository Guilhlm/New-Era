'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { NativeDialog } from '@/components/ui/native-dialog';
import { cn } from '@/components/ui/cn';
import { SegmentedControl, SegmentedControlItem } from '@/components/ui/segmented-control';
import { typeClass, typeToneClass } from '@/lib/typography';
import { WalletNumericInput } from '@/components/wallet/wallet-numeric-input';
import {
  walletDialogActionsClass,
  walletDialogFieldClass,
  walletDialogFormClass,
  walletDialogPrimaryActionsClass,
  walletDialogSectionClass,
  walletDialogSegmentClass,
  walletDialogSegmentItemClass,
} from '@/components/wallet/wallet-dialog-layout';
import type { QuoteCurrency } from '@/types/finance';
import type { WalletCurrency } from '@/types/wallet';
import { formatWalletAmount, formatWalletAmountDraft, convertUsdtToDisplay, isInsufficientWalletBalance, resolveCashSubmitAmount, roundUsdt } from '@/utils/wallet';
import { parseLocaleAmount } from '@/utils/wallet-number-input';

export type WalletCashMode = 'deposit' | 'withdraw';

type WalletCashDialogProps = {
  open: boolean;
  saving?: boolean;
  defaultMode?: WalletCashMode;
  defaultCurrency?: WalletCurrency;
  fxRate?: number;
  availableBalanceUsdt?: number;
  onClose: () => void;
  onSubmit: (input: {
    amount: number;
    currency: QuoteCurrency;
    mode: WalletCashMode;
    source?: 'MONTHLY_SALARY' | 'EXTRA_INCOME';
  }) => void;
};

export function WalletCashDialog({
  open,
  saving,
  defaultMode = 'deposit',
  defaultCurrency = 'USDT',
  fxRate = 1,
  availableBalanceUsdt = 0,
  onClose,
  onSubmit,
}: WalletCashDialogProps) {
  const [mode, setMode] = useState<WalletCashMode>(defaultMode);
  const [currency, setCurrency] = useState<QuoteCurrency>(defaultCurrency);
  const [source, setSource] = useState<'MONTHLY_SALARY' | 'EXTRA_INCOME'>('EXTRA_INCOME');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (!open) return;
    setMode(defaultMode);
    setCurrency(defaultCurrency);
    setSource('EXTRA_INCOME');
    setAmount('');
  }, [open, defaultMode, defaultCurrency]);

  const parsedAmount = parseLocaleAmount(amount) ?? 0;
  const conversionFxRate = currency === 'BRL' ? fxRate : 1;
  const amountUsdt = roundUsdt(
    currency === 'BRL' && conversionFxRate > 0 ? parsedAmount / conversionFxRate : parsedAmount,
  );
  const isWithdraw = mode === 'withdraw';
  const fxUnavailable = currency === 'BRL' && conversionFxRate <= 1;
  const maxWithdrawDisplay = convertUsdtToDisplay(availableBalanceUsdt, { currency, fxRate: conversionFxRate });
  const submitAmount =
    parsedAmount > 0
      ? resolveCashSubmitAmount(parsedAmount, {
          currency,
          fxRate: conversionFxRate,
          mode,
          availableUsdt: availableBalanceUsdt,
        })
      : null;
  const insufficientBalance =
    isWithdraw &&
    !fxUnavailable &&
    isInsufficientWalletBalance(amountUsdt, availableBalanceUsdt, {
      currency,
      fxRate: conversionFxRate,
      requiredDisplay: Math.round(parsedAmount * 100) / 100,
    });
  const amountTooLarge =
    parsedAmount > 0 && submitAmount == null && !fxUnavailable && !insufficientBalance;
  const balanceOpts = { currency, fxRate: conversionFxRate };

  return (
    <NativeDialog
      open={open}
      size="wide"
      ariaLabelledBy="wallet-cash-title"
      onClose={() => {
        setAmount('');
        onClose();
      }}
    >
      <form
        method="dialog"
        className={walletDialogFormClass}
        onSubmit={(event) => {
          event.preventDefault();
          if (parsedAmount <= 0 || amountUsdt <= 0 || fxUnavailable) return;
          if (insufficientBalance || submitAmount == null) return;
          onSubmit({
            amount: submitAmount,
            currency,
            mode,
            source: mode === 'deposit' ? source : undefined,
          });
          setAmount('');
        }}
      >
        <p id="wallet-cash-title" className={cn(typeClass.title, typeToneClass.default)}>
          Wallet funds
        </p>

        <SegmentedControl variant="soft" className={walletDialogSegmentClass}>
          <SegmentedControlItem
            active={mode === 'deposit'}
            className={cn(walletDialogSegmentItemClass, typeClass.micro)}
            onClick={() => setMode('deposit')}
          >
            Deposit
          </SegmentedControlItem>
          <SegmentedControlItem
            active={mode === 'withdraw'}
            className={cn(walletDialogSegmentItemClass, typeClass.micro)}
            onClick={() => setMode('withdraw')}
          >
            Withdraw
          </SegmentedControlItem>
        </SegmentedControl>

        {mode === 'deposit' ? (
          <SegmentedControl variant="soft" className={walletDialogSegmentClass}>
            <SegmentedControlItem
              active={source === 'EXTRA_INCOME'}
              className={cn(walletDialogSegmentItemClass, typeClass.micro)}
              onClick={() => setSource('EXTRA_INCOME')}
            >
              Renda extra
            </SegmentedControlItem>
            <SegmentedControlItem
              active={source === 'MONTHLY_SALARY'}
              className={cn(walletDialogSegmentItemClass, typeClass.micro)}
              onClick={() => setSource('MONTHLY_SALARY')}
            >
              Monthly salary
            </SegmentedControlItem>
          </SegmentedControl>
        ) : null}

        <SegmentedControl variant="soft" className={walletDialogSegmentClass}>
          <SegmentedControlItem
            active={currency === 'USDT'}
            className={cn(walletDialogSegmentItemClass, typeClass.micro)}
            onClick={() => setCurrency('USDT')}
          >
            USDT
          </SegmentedControlItem>
          <SegmentedControlItem
            active={currency === 'BRL'}
            className={cn(walletDialogSegmentItemClass, typeClass.micro)}
            onClick={() => setCurrency('BRL')}
          >
            BRL
          </SegmentedControlItem>
        </SegmentedControl>

        {isWithdraw ? (
          <div className={cn(walletDialogSectionClass, typeClass.caption)}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p>
                <span className={typeToneClass.muted}>Available </span>
                <span className={typeClass.bodyStrong}>
                  {formatWalletAmount(availableBalanceUsdt, balanceOpts)}
                </span>
              </p>
              <button
                type="button"
                disabled={saving || fxUnavailable || maxWithdrawDisplay <= 0}
                className={cn(typeClass.micro, 'text-red transition hover:brightness-110 disabled:opacity-50')}
                onClick={() => setAmount(formatWalletAmountDraft(maxWithdrawDisplay))}
              >
                Withdraw all
              </button>
            </div>
          </div>
        ) : null}

        <label className={cn(walletDialogFieldClass, typeClass.body)}>
          <span className={typeToneClass.muted}>
            Amount ({currency === 'BRL' ? 'BRL' : 'USDT'})
          </span>
          <WalletNumericInput value={amount} disabled={saving} onChange={setAmount} />
          {parsedAmount > 0 && currency === 'BRL' ? (
            <span className={cn(typeClass.micro, typeToneClass.muted60)}>
              ≈ {formatWalletAmount(amountUsdt, { currency: 'USDT' })}
            </span>
          ) : null}
          {fxUnavailable ? (
            <span className={cn(typeClass.micro, typeToneClass.muted60)}>
              Waiting for BRL/USDT quote…
            </span>
          ) : null}
          {amountTooLarge ? (
            <span className={cn(typeClass.micro, typeToneClass.negative)}>
              Valor acima do limite permitido.
            </span>
          ) : null}
          {insufficientBalance ? (
            <span className={cn(typeClass.micro, typeToneClass.negative)}>
              Saldo insuficiente para este saque.
            </span>
          ) : null}
        </label>

        <div className={walletDialogActionsClass}>
          <div className={walletDialogPrimaryActionsClass}>
            <Button
              type="submit"
              variant="primary"
              disabled={
                saving ||
                parsedAmount <= 0 ||
                insufficientBalance ||
                fxUnavailable ||
                submitAmount == null
              }
              className="flex-1"
            >
              {saving ? 'Processing…' : isWithdraw ? 'Confirm withdraw' : 'Confirm deposit'}
            </Button>
            <Button type="button" variant="secondary" disabled={saving} onClick={onClose} className="flex-1 sm:flex-none sm:min-w-[7.5rem]">
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </NativeDialog>
  );
}
