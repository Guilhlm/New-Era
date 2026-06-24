'use client';

import { useEffect, useMemo, useState } from 'react';
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
import { getMarketAssetRow } from '@/services/finance';
import type { QuoteCurrency } from '@/types/finance';
import type { WalletCurrency, WalletInvestmentRowVm, WalletInvestmentTab } from '@/types/wallet';
import { mapMarketRowToVm } from '@/utils/market-mapper';
import { clampFinanceUsdt, convertUsdtToDisplay, displayAmountToUsdt, formatWalletAmount, formatWalletAssetPrice, formatWalletAmountDraft, resolveSpendUsdt, roundUsdt, roundWalletDisplayAmount, tryResolveBuyTrade, walletAmountToBrlCents, walletDisplayToCents } from '@/utils/wallet';
import { parseLocaleAmount, parseLocaleShares } from '@/utils/wallet-number-input';
import {
  formatPositionShares,
  getDefaultTradeQuantity,
  isFractionalAsset,
  MIN_TRADE_SHARES,
  roundShares,
  sharesExceedPosition,
} from '@/utils/wallet-trade';

type TradeInputMode = 'quantity' | 'amount';

type WalletTradeDialogProps = {
  open: boolean;
  saving?: boolean;
  action: 'BUY' | 'SELL';
  row: WalletInvestmentRowVm | null;
  currency: QuoteCurrency;
  fxRate: number;
  availableBalanceUsdt?: number;
  investmentTab?: WalletInvestmentTab;
  onClose: () => void;
  onConfirm: (shares: number, priceUsdt: number, budgetUsdt?: number) => void;
  onDeposit?: () => void;
};

export function WalletTradeDialog({
  open,
  saving,
  action,
  row,
  currency,
  fxRate,
  availableBalanceUsdt = 0,
  investmentTab = 'crypto',
  onClose,
  onConfirm,
  onDeposit,
}: WalletTradeDialogProps) {
  const [inputMode, setInputMode] = useState<TradeInputMode>('quantity');
  const [quantity, setQuantity] = useState('0,001');
  const [amount, setAmount] = useState('');
  const [quoteRow, setQuoteRow] = useState<WalletInvestmentRowVm | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  const activeRow = quoteRow ?? row;
  const fractional = activeRow ? isFractionalAsset(activeRow.type) : false;

  useEffect(() => {
    if (!open || !row) {
      setQuoteRow(null);
      setQuoteLoading(false);
      return;
    }
    setQuoteRow(null);
    setInputMode('quantity');
    setQuantity(getDefaultTradeQuantity(row, action));
    setAmount('');

    if (row.priceUsdt > 0) return;

    let cancelled = false;
    setQuoteLoading(true);
    void getMarketAssetRow(investmentTab, row.ticker, currency)
      .then(({ row: refreshed }) => {
        if (cancelled || !refreshed || refreshed.priceUsdt <= 0) return;
        setQuoteRow(mapMarketRowToVm(refreshed));
      })
      .finally(() => {
        if (!cancelled) setQuoteLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, row, action, currency, investmentTab]);

  const parsed = useMemo(() => {
    if (!activeRow) {
      return {
        shares: 0,
        priceUsdt: 0,
        totalUsdt: 0,
        totalDisplay: 0,
      };
    }

    const priceUsdt =
      activeRow.priceUsdt > 0
        ? activeRow.priceUsdt
        : currency === 'BRL' && fxRate > 0
          ? activeRow.currentPrice / fxRate
          : activeRow.currentPrice;

    if (inputMode === 'amount' && fractional) {
      const amountDisplay = parseLocaleAmount(amount) ?? 0;
      let amountUsdt = displayAmountToUsdt(amountDisplay, currency, fxRate);
      if (action === 'BUY') {
        const availableCents =
          currency === 'BRL' && fxRate > 0
            ? walletAmountToBrlCents(availableBalanceUsdt, fxRate)
            : walletDisplayToCents(availableBalanceUsdt);
        const requiredCents = walletDisplayToCents(amountDisplay);
        if (requiredCents >= availableCents) {
          amountUsdt = roundUsdt(availableBalanceUsdt);
        }
      }
      let shares = priceUsdt > 0 ? amountUsdt / priceUsdt : 0;
      if (action === 'SELL' && shares > activeRow.shares) {
        shares = activeRow.shares;
        amountUsdt = roundUsdt(shares * priceUsdt);
      }
      return {
        shares,
        priceUsdt,
        totalUsdt: amountUsdt,
        totalDisplay: roundWalletDisplayAmount(amountDisplay),
      };
    }

    const shares = parseLocaleShares(quantity) ?? 0;
    const totalUsdt = roundUsdt(shares * priceUsdt);
    const totalDisplay = roundWalletDisplayAmount(shares * activeRow.currentPrice);
    return {
      shares,
      priceUsdt,
      totalUsdt,
      totalDisplay,
    };
  }, [activeRow, inputMode, quantity, amount, currency, fxRate, availableBalanceUsdt, action, fractional]);

  if (!activeRow) return null;

  const isSell = action === 'SELL';
  const canSell = activeRow.hasPosition && activeRow.shares > 0;
  const exceedsPosition = isSell && sharesExceedPosition(parsed.shares, activeRow.shares);
  const belowMinShares = parsed.shares > 0 && parsed.shares < MIN_TRADE_SHARES;
  const priceUnavailable = !isSell && parsed.priceUsdt <= 0;
  const fxUnavailable = !isSell && currency === 'BRL' && fxRate <= 1;
  const isAmountModeBuy = !isSell && inputMode === 'amount' && fractional;
  const spendUsdt = isSell
    ? roundUsdt(parsed.totalUsdt)
    : resolveSpendUsdt(parsed.totalUsdt, availableBalanceUsdt, {
        currency: currency as WalletCurrency,
        fxRate,
        requiredDisplay: parsed.totalDisplay,
      });
  const resolvedBuy =
    !isSell && parsed.priceUsdt > 0 && spendUsdt > 0
      ? tryResolveBuyTrade(parsed.priceUsdt, availableBalanceUsdt, {
          budgetUsdt: isAmountModeBuy ? spendUsdt : undefined,
          shares: isAmountModeBuy ? undefined : roundShares(parsed.shares),
        })
      : null;
  const insufficientBalance =
    !isSell &&
    !priceUnavailable &&
    !fxUnavailable &&
    parsed.totalUsdt > 0 &&
    (spendUsdt <= 0 || !resolvedBuy);
  const displayCurrency = currency as WalletCurrency;
  const amountOpts = { currency: displayCurrency, alreadyConverted: true as const };
  const balanceDisplayOpts = { currency: displayCurrency, fxRate };
  const quantityLabel = fractional ? 'Quantity' : 'Shares';
  const amountLabel = currency === 'BRL' ? 'Valor (BRL)' : 'Valor (USDT)';

  const availableDisplayAmount = convertUsdtToDisplay(availableBalanceUsdt, {
    currency: displayCurrency,
    fxRate,
  });

  return (
    <NativeDialog
      open={open}
      size="wide"
      ariaLabelledBy="trade-title"
      onClose={() => {
        onClose();
      }}
    >
      <form
        method="dialog"
        className={walletDialogFormClass}
        onSubmit={(event) => {
          event.preventDefault();
          if (parsed.shares <= 0 || parsed.priceUsdt <= 0) return;
          if (parsed.shares < MIN_TRADE_SHARES) return;
          if (isSell && (!canSell || exceedsPosition)) return;
          if (insufficientBalance || priceUnavailable || fxUnavailable) return;

          const shares = isSell
            ? roundShares(parsed.shares)
            : (resolvedBuy?.shares ?? 0);
          const budgetUsdt =
            isAmountModeBuy && resolvedBuy
              ? clampFinanceUsdt(Math.min(resolvedBuy.debitUsdt, availableBalanceUsdt))
              : undefined;
          onConfirm(shares, parsed.priceUsdt, budgetUsdt);
        }}
      >
        <div>
          <p id="trade-title" className={cn(typeClass.title, typeToneClass.default)}>
            {isSell ? 'Sell' : 'Buy'} {activeRow.ticker}
          </p>
          <p className={cn('mt-1', typeClass.caption, typeToneClass.muted)}>
            {activeRow.name} · {formatWalletAssetPrice(activeRow.currentPrice, amountOpts)}
          </p>
          {fractional ? (
            <p className={cn('mt-1', typeClass.micro, typeToneClass.muted60)}>
              Fractional shares allowed (e.g. 0.001 BTC)
            </p>
          ) : null}
        </div>

        {!isSell ? (
          <div className={cn(walletDialogSectionClass, typeClass.caption)}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p>
                <span className={typeToneClass.muted}>Available to invest </span>
                <span className={typeClass.bodyStrong}>
                  {formatWalletAmount(availableBalanceUsdt, balanceDisplayOpts)}
                </span>
              </p>
              {fractional && inputMode === 'amount' ? (
                <button
                  type="button"
                  disabled={saving || availableDisplayAmount <= 0}
                  className={cn(typeClass.micro, 'text-red transition hover:brightness-110 disabled:opacity-50')}
                  onClick={() => setAmount(formatWalletAmountDraft(availableDisplayAmount))}
                >
                  Usar saldo
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <div className={cn(walletDialogSectionClass, typeClass.caption)}>
            <span className={typeToneClass.muted}>Wallet credit after sale </span>
            <span className={typeClass.bodyStrong}>
              {formatWalletAmount(parsed.totalDisplay, amountOpts)}
            </span>
          </div>
        )}

        {fractional ? (
          <SegmentedControl variant="soft" className={walletDialogSegmentClass}>
            <SegmentedControlItem
              active={inputMode === 'quantity'}
              className={cn(walletDialogSegmentItemClass, typeClass.micro)}
              onClick={() => setInputMode('quantity')}
            >
              Por quantidade
            </SegmentedControlItem>
            <SegmentedControlItem
              active={inputMode === 'amount'}
              className={cn(walletDialogSegmentItemClass, typeClass.micro)}
              onClick={() => setInputMode('amount')}
            >
              Por valor
            </SegmentedControlItem>
          </SegmentedControl>
        ) : null}

        <label className={cn(walletDialogFieldClass, typeClass.body)}>
          <span className={typeToneClass.muted}>
            {inputMode === 'amount' && fractional ? amountLabel : quantityLabel}
          </span>
          {inputMode === 'amount' && fractional ? (
            <WalletNumericInput value={amount} disabled={saving} onChange={setAmount} variant="amount" />
          ) : (
            <WalletNumericInput
              value={quantity}
              disabled={saving}
              onChange={setQuantity}
              variant="shares"
              hint={false}
            />
          )}
          {isSell && activeRow.hasPosition ? (
            <span className={cn(typeClass.micro, typeToneClass.muted60)}>
              Available: {formatPositionShares(activeRow.shares, activeRow.type)} {activeRow.ticker}
            </span>
          ) : null}
          {inputMode === 'amount' && fractional && parsed.shares > 0 ? (
            <span className={cn(typeClass.micro, typeToneClass.muted60)}>
              ≈ {formatPositionShares(parsed.shares, activeRow.type)} {activeRow.ticker}
            </span>
          ) : null}
          {belowMinShares ? (
            <span className={cn(typeClass.micro, typeToneClass.negative)}>
              Minimum quantity: {formatPositionShares(MIN_TRADE_SHARES, activeRow.type)} {activeRow.ticker}
            </span>
          ) : null}
          {exceedsPosition ? (
            <span className={cn(typeClass.micro, typeToneClass.negative)}>
              Quantity exceeds position.
            </span>
          ) : null}
          {priceUnavailable ? (
            <span className={cn(typeClass.micro, typeToneClass.muted60)}>
              {quoteLoading ? 'Waiting for asset quote…' : 'Quote unavailable for this asset.'}
            </span>
          ) : null}
          {fxUnavailable ? (
            <span className={cn(typeClass.micro, typeToneClass.muted60)}>
              Waiting for BRL/USDT quote…
            </span>
          ) : null}
          {insufficientBalance ? (
            <span className={cn(typeClass.micro, typeToneClass.negative)}>
              Insufficient balance. Deposit funds to continue.
            </span>
          ) : null}
        </label>

        <div className={cn(walletDialogSectionClass, typeClass.caption)}>
          <span className={typeToneClass.muted}>Total </span>
          <span className={typeClass.bodyStrong}>
            {formatWalletAmount(parsed.totalDisplay, amountOpts)}
          </span>
        </div>

        <div className={walletDialogActionsClass}>
          {insufficientBalance && onDeposit && !priceUnavailable ? (
            <Button
              type="button"
              variant="primary"
              disabled={saving}
              className="w-full sm:order-last"
              onClick={() => {
                onClose();
                onDeposit();
              }}
            >
              Deposit funds
            </Button>
          ) : null}
          <div className={walletDialogPrimaryActionsClass}>
            <Button
              type="submit"
              variant="primary"
              disabled={
                saving ||
                priceUnavailable ||
                fxUnavailable ||
                parsed.shares < MIN_TRADE_SHARES ||
                (isSell && (!canSell || exceedsPosition)) ||
                insufficientBalance
              }
              className="flex-1"
            >
              {saving ? 'Processing…' : isSell ? 'Confirm sell' : 'Confirm buy'}
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
