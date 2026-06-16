'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { NativeDialog } from '@/components/ui/native-dialog';
import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';
import { WalletNumericInput } from '@/components/wallet/wallet-numeric-input';
import {
  walletDialogActionsClass,
  walletDialogFieldClass,
  walletDialogFormClass,
  walletDialogPrimaryActionsClass,
  walletDialogSectionClass,
} from '@/components/wallet/wallet-dialog-layout';
import type { QuoteCurrency, UpdateInvestmentInput } from '@/types/finance';
import type { WalletCurrency, WalletInvestmentRowVm } from '@/types/wallet';
import { formatWalletAmount, roundUsdt } from '@/utils/wallet';
import {
  formatAmountDraft,
  formatSharesDraft,
  parseLocaleAmount,
  parseLocaleShares,
} from '@/utils/wallet-number-input';

type WalletInvestmentEditSheetProps = {
  open: boolean;
  investment: WalletInvestmentRowVm | null;
  saving?: boolean;
  currency?: QuoteCurrency;
  fxRate?: number;
  onClose: () => void;
  onSave: (id: string, input: UpdateInvestmentInput) => void;
  onDelete: (id: string) => void;
};

export function WalletInvestmentEditSheet({
  open,
  investment,
  saving,
  currency = 'USDT',
  fxRate = 1,
  onClose,
  onSave,
  onDelete,
}: WalletInvestmentEditSheetProps) {
  const [shares, setShares] = useState('');
  const [avgPrice, setAvgPrice] = useState('');

  useEffect(() => {
    if (!investment) return;
    setShares(formatSharesDraft(investment.shares));
    setAvgPrice(formatAmountDraft(investment.avgPrice));
  }, [investment]);

  if (!investment) return null;

  const amountOpts = { currency: currency as WalletCurrency, alreadyConverted: true as const };

  return (
    <NativeDialog open={open} size="wide" ariaLabelledBy="edit-investment-title" onClose={onClose}>
      <form
        method="dialog"
        className={walletDialogFormClass}
        onSubmit={(event) => {
          event.preventDefault();
          const parsedShares = parseLocaleShares(shares);
          const parsedAvg = parseLocaleAmount(avgPrice);
          if (
            !investment.id ||
            parsedShares == null ||
            parsedShares <= 0 ||
            parsedAvg == null ||
            parsedAvg < 0
          ) {
            return;
          }

          const avgPriceUsdt =
            currency === 'BRL' && fxRate > 0
              ? roundUsdt(parsedAvg / fxRate)
              : roundUsdt(parsedAvg);
          const currentPriceUsdt =
            currency === 'BRL' && fxRate > 0
              ? roundUsdt(investment.currentPrice / fxRate)
              : roundUsdt(investment.currentPrice);

          onSave(investment.id, {
            shares: parsedShares,
            avgPrice: avgPriceUsdt,
            currentPrice: currentPriceUsdt,
          });
        }}
      >
        <div>
          <p id="edit-investment-title" className={cn(typeClass.title, typeToneClass.default)}>
            Editar posição
          </p>
          <p className={cn('mt-1', typeClass.caption, typeToneClass.muted)}>
            {investment.ticker} · {investment.name}
          </p>
        </div>

        <div className={cn(walletDialogSectionClass, typeClass.caption)}>
          <span className={typeToneClass.muted}>Preço atual </span>
          <span className={typeClass.bodyStrong}>
            {formatWalletAmount(investment.currentPrice, amountOpts)}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          <label className={cn(walletDialogFieldClass, typeClass.body)}>
            <span className={typeToneClass.muted}>Quantidade</span>
            <WalletNumericInput value={shares} disabled={saving} hint={false} onChange={setShares} />
          </label>
          <label className={cn(walletDialogFieldClass, typeClass.body)}>
            <span className={typeToneClass.muted}>Preço médio ({currency})</span>
            <WalletNumericInput value={avgPrice} disabled={saving} onChange={setAvgPrice} />
          </label>
        </div>

        <div className={walletDialogActionsClass}>
          <div className={cn(walletDialogPrimaryActionsClass, 'sm:flex-wrap')}>
            <Button type="submit" variant="primary" disabled={saving} className="flex-1">
              {saving ? 'Salvando…' : 'Salvar'}
            </Button>
            <Button type="button" variant="secondary" disabled={saving} onClick={onClose} className="flex-1 sm:flex-none sm:min-w-[7.5rem]">
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={saving}
              className="w-full sm:w-auto sm:min-w-[7.5rem]"
              onClick={() => investment.id && onDelete(investment.id)}
            >
              Remover
            </Button>
          </div>
        </div>
      </form>
    </NativeDialog>
  );
}
