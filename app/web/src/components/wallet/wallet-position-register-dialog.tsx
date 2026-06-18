'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { NativeDialog } from '@/components/ui/native-dialog';
import { cn } from '@/components/ui/cn';
import { SegmentedControl, SegmentedControlItem } from '@/components/ui/segmented-control';
import { typeClass, typeToneClass } from '@/lib/typography';
import { useIsClientMounted } from '@/hooks/use-is-client-mounted';
import { WalletNumericInput } from '@/components/wallet/wallet-numeric-input';
import {
  walletDialogActionsClass,
  walletDialogFieldClass,
  walletDialogFormClass,
  walletDialogPrimaryActionsClass,
  walletDialogSectionClass,
  walletDialogSegmentClass,
  walletDialogSegmentItemClass,
  walletDialogSelectClass,
} from '@/components/wallet/wallet-dialog-layout';
import type { QuoteCurrency, RegisterPositionInput } from '@/types/finance';
import type { WalletCurrency, WalletInvestmentRowVm } from '@/types/wallet';
import { formatWalletAmount, formatWalletAssetPrice } from '@/utils/wallet';
import { parseLocaleAmount, parseLocaleShares } from '@/utils/wallet-number-input';
import { getDefaultTradeQuantity, isFractionalAsset } from '@/utils/wallet-trade';

type CostInputMode = 'total' | 'avg';

type WalletPositionRegisterDialogProps = {
  open: boolean;
  saving?: boolean;
  rows: WalletInvestmentRowVm[];
  currency: QuoteCurrency;
  fxRate?: number;
  preselectedRow?: WalletInvestmentRowVm | null;
  onClose: () => void;
  onRegister: (input: RegisterPositionInput) => void;
};

export function WalletPositionRegisterDialog({
  open,
  saving,
  rows,
  currency,
  fxRate = 1,
  preselectedRow,
  onClose,
  onRegister,
}: WalletPositionRegisterDialogProps) {
  const [ticker, setTicker] = useState('');
  const [costMode, setCostMode] = useState<CostInputMode>('total');
  const [shares, setShares] = useState('0,001');
  const [costValue, setCostValue] = useState('');

  const selectedRow = useMemo(
    () => rows.find((row) => row.ticker === ticker) ?? null,
    [rows, ticker],
  );

  useEffect(() => {
    if (!open) return;
    const row = preselectedRow ?? rows[0] ?? null;
    setTicker(row?.ticker ?? '');
    setCostMode('total');
    setShares(row ? getDefaultTradeQuantity(row, 'BUY') : '1');
    setCostValue('');
  }, [open, preselectedRow, rows]);

  const parsedShares = parseLocaleShares(shares) ?? 0;
  const parsedCost = parseLocaleAmount(costValue) ?? 0;
  const amountOpts = { currency: currency as WalletCurrency, alreadyConverted: true as const };
  const mounted = useIsClientMounted();

  const estimatedAvg =
    costMode === 'total' && parsedShares > 0 && parsedCost > 0
      ? parsedCost / parsedShares
      : parsedCost;

  const canSubmit =
    mounted &&
    Boolean(ticker) &&
    parsedShares > 0 &&
    parsedCost > 0 &&
    Boolean(selectedRow);

  return (
    <NativeDialog
      open={open}
      size="wide"
      ariaLabelledBy="register-position-title"
      onClose={() => {
        onClose();
      }}
    >
      <form
        method="dialog"
        className={walletDialogFormClass}
        onSubmit={(event) => {
          event.preventDefault();
          if (!canSubmit || !selectedRow) return;

          const payload: RegisterPositionInput = {
            ticker: selectedRow.ticker,
            name: selectedRow.name,
            type: selectedRow.type as RegisterPositionInput['type'],
            shares: parsedShares,
            costCurrency: currency,
            ...(costMode === 'total'
              ? { costTotal: parsedCost }
              : { avgPrice: parsedCost }),
          };

          onRegister(payload);
        }}
      >
        <div>
          <p id="register-position-title" className={cn(typeClass.title, typeToneClass.default)}>
            Register position
          </p>
          <p className={cn('mt-1', typeClass.caption, typeToneClass.muted60)}>
            Enter what you already own and how much you paid. Does not debit wallet balance.
          </p>
        </div>

        <label className={cn(walletDialogFieldClass, typeClass.body)}>
          <span className={typeToneClass.muted}>Ativo</span>
          <select
            value={ticker}
            disabled={saving || Boolean(preselectedRow)}
            className={walletDialogSelectClass}
            onChange={(event) => {
              const nextTicker = event.target.value;
              setTicker(nextTicker);
              const row = rows.find((item) => item.ticker === nextTicker);
              if (row) {
                setShares(getDefaultTradeQuantity(row, 'BUY'));
              }
            }}
          >
            {rows.map((row) => (
              <option key={row.ticker} value={row.ticker}>
                {row.ticker} · {row.name}
              </option>
            ))}
          </select>
          {selectedRow ? (
            <span className={cn(typeClass.micro, typeToneClass.muted60)}>
              Current price: {formatWalletAssetPrice(selectedRow.currentPrice, amountOpts)}
            </span>
          ) : null}
        </label>

        <label className={cn(walletDialogFieldClass, typeClass.body)}>
          <span className={typeToneClass.muted}>Quantity</span>
          <WalletNumericInput
            value={shares}
            disabled={saving}
            variant={selectedRow && isFractionalAsset(selectedRow.type) ? 'shares' : 'amount'}
            hint={false}
            onChange={setShares}
          />
        </label>

        <SegmentedControl variant="soft" className={walletDialogSegmentClass}>
          <SegmentedControlItem
            active={costMode === 'total'}
            className={cn(walletDialogSegmentItemClass, typeClass.micro)}
            onClick={() => setCostMode('total')}
          >
            Total Paid
          </SegmentedControlItem>
          <SegmentedControlItem
            active={costMode === 'avg'}
            className={cn(walletDialogSegmentItemClass, typeClass.micro)}
            onClick={() => setCostMode('avg')}
          >
            Average price
          </SegmentedControlItem>
        </SegmentedControl>

        <label className={cn(walletDialogFieldClass, typeClass.body)}>
          <span className={typeToneClass.muted}>
            {costMode === 'total'
              ? `Total Paid (${currency})`
              : `Average price per unit (${currency})`}
          </span>
          <WalletNumericInput value={costValue} disabled={saving} onChange={setCostValue} />
          {costMode === 'total' && parsedShares > 0 && parsedCost > 0 ? (
            <span className={cn(typeClass.micro, typeToneClass.muted60)}>
              Estimated average price: {formatWalletAmount(estimatedAvg, amountOpts)}
            </span>
          ) : null}
        </label>

        <div className={walletDialogActionsClass}>
          <div className={walletDialogPrimaryActionsClass}>
            <Button type="submit" variant="primary" disabled={saving || !canSubmit} className="flex-1">
              {saving ? 'Saving…' : 'Register position'}
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
