'use client';

import { useState } from 'react';
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
import { formatWalletAmount, formatWalletAmountDraft, convertUsdtToDisplay, isInsufficientWalletBalance, resolveCashSubmitAmount, roundUsdt } from '@/utils/wallet';
import { parseLocaleAmount } from '@/utils/wallet-number-input';

export type WalletCashMode = 'deposit' | 'withdraw';

type WalletCashDialogProps = {
  open: boolean;
  saving?: boolean;
  defaultMode?: WalletCashMode;
  fxRate?: number;
  availableBalanceUsdt?: number;
  maxDepositBrl?: number | null;
  onClose: () => void;
  onSubmit: (input: {
    amount: number;
    currency: QuoteCurrency;
    mode: WalletCashMode;
  }) => void;
};

export function WalletCashDialog({
  open,
  saving,
  defaultMode = 'deposit',
  fxRate = 1,
  availableBalanceUsdt = 0,
  maxDepositBrl = null,
  onClose,
  onSubmit,
}: WalletCashDialogProps) {
  const [mode, setMode] = useState<WalletCashMode>(defaultMode);
  const [amount, setAmount] = useState('');

  const isWithdraw = mode === 'withdraw';
  const cashCurrency: QuoteCurrency = 'BRL';
  const parsedAmount = parseLocaleAmount(amount) ?? 0;
  const conversionFxRate = cashCurrency === 'BRL' ? fxRate : 1;
  const amountUsdt = roundUsdt(
    cashCurrency === 'BRL' && conversionFxRate > 0 ? parsedAmount / conversionFxRate : parsedAmount,
  );
  const fxUnavailable = cashCurrency === 'BRL' && conversionFxRate <= 1;
  const maxWithdrawDisplay = convertUsdtToDisplay(availableBalanceUsdt, { currency: cashCurrency, fxRate: conversionFxRate });
  const submitAmount =
    parsedAmount > 0
      ? resolveCashSubmitAmount(parsedAmount, {
          currency: cashCurrency,
          fxRate: conversionFxRate,
          mode,
          availableUsdt: availableBalanceUsdt,
        })
      : null;
  const insufficientBalance =
    isWithdraw &&
    !fxUnavailable &&
    isInsufficientWalletBalance(amountUsdt, availableBalanceUsdt, {
      currency: cashCurrency,
      fxRate: conversionFxRate,
      requiredDisplay: Math.round(parsedAmount * 100) / 100,
    });
  const amountTooLarge =
    parsedAmount > 0 && submitAmount == null && !fxUnavailable && !insufficientBalance;
  const depositExceedsSalary =
    !isWithdraw &&
    maxDepositBrl != null &&
    parsedAmount > Math.max(0, maxDepositBrl);
  const balanceOpts = { currency: cashCurrency, fxRate: conversionFxRate };
  const closeDialog = () => {
    setAmount('');
    onClose();
  };

  return (
    <NativeDialog
      open={open}
      size="wide"
      ariaLabelledBy="wallet-cash-title"
      onClose={closeDialog}
    >
      <form
        method="dialog"
        className={walletDialogFormClass}
        onSubmit={(event) => {
          event.preventDefault();
          if (parsedAmount <= 0 || amountUsdt <= 0 || fxUnavailable) return;
          if (insufficientBalance || depositExceedsSalary || submitAmount == null) return;
          onSubmit({
            amount: submitAmount,
            currency: cashCurrency,
            mode,
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
            Amount ({cashCurrency === 'BRL' ? 'BRL' : 'USDT'})
          </span>
          <WalletNumericInput value={amount} disabled={saving} onChange={setAmount} />
          {parsedAmount > 0 && cashCurrency === 'BRL' ? (
            <span className={cn(typeClass.micro, typeToneClass.muted60)}>
              ≈ {formatWalletAmount(amountUsdt, { currency: 'USDT' })}
            </span>
          ) : null}
          {fxUnavailable ? (
            <span className={cn(typeClass.micro, typeToneClass.muted60)}>
              Waiting for BRL/USDT quote…
            </span>
          ) : null}
          {!isWithdraw && maxDepositBrl != null ? (
            <span className={cn(typeClass.micro, typeToneClass.muted60)}>
              Available this month: {formatWalletAmount(Math.max(0, maxDepositBrl), { currency: 'BRL', alreadyConverted: true })}
            </span>
          ) : null}
          {amountTooLarge ? (
            <span className={cn(typeClass.micro, typeToneClass.negative)}>
              Value exceeds the permitted limit.
            </span>
          ) : null}
          {depositExceedsSalary ? (
            <span className={cn(typeClass.micro, typeToneClass.negative)}>
              Amount exceeds the salary available this month.
            </span>
          ) : null}
          {insufficientBalance ? (
            <span className={cn(typeClass.micro, typeToneClass.negative)}>
              Insufficient balance for this withdrawal.
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
                depositExceedsSalary ||
                fxUnavailable ||
                submitAmount == null
              }
              className="flex-1"
            >
              {saving ? 'Processing…' : isWithdraw ? 'Confirm withdraw' : 'Confirm deposit'}
            </Button>
            <Button type="button" variant="secondary" disabled={saving} onClick={closeDialog} className="flex-1 sm:flex-none sm:min-w-[7.5rem]">
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </NativeDialog>
  );
}
