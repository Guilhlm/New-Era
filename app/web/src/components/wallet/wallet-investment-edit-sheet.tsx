'use client';

import { Button } from '@/components/ui/button';
import { NativeDialog } from '@/components/ui/native-dialog';
import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';
import {
  walletDialogActionsClass,
  walletDialogFormClass,
  walletDialogPrimaryActionsClass,
  walletDialogSectionClass,
} from '@/components/wallet/wallet-dialog-layout';
import type { QuoteCurrency } from '@/types/finance';
import type { WalletCurrency, WalletInvestmentRowVm } from '@/types/wallet';
import { formatWalletAmount } from '@/utils/wallet';
import { formatPositionShares } from '@/utils/wallet-trade';

type WalletInvestmentEditSheetProps = {
  open: boolean;
  investment: WalletInvestmentRowVm | null;
  saving?: boolean;
  currency?: QuoteCurrency;
  onClose: () => void;
  onDelete: (id: string) => void;
};

export function WalletInvestmentEditSheet({
  open,
  investment,
  saving,
  currency = 'USDT',
  onClose,
  onDelete,
}: WalletInvestmentEditSheetProps) {
  if (!investment) return null;

  const amountOpts = { currency: currency as WalletCurrency, alreadyConverted: true as const };

  return (
    <NativeDialog open={open} size="wide" ariaLabelledBy="edit-investment-title" onClose={onClose}>
      <div className={walletDialogFormClass}>
        <div>
          <p id="edit-investment-title" className={cn(typeClass.title, typeToneClass.default)}>
            Position details
          </p>
          <p className={cn('mt-1', typeClass.caption, typeToneClass.muted)}>
            {investment.ticker} · {investment.name}
          </p>
        </div>

        <div className={cn(walletDialogSectionClass, typeClass.caption)}>
          <span className={typeToneClass.muted}>Current price </span>
          <span className={typeClass.bodyStrong}>
            {formatWalletAmount(investment.currentPrice, amountOpts)}
          </span>
        </div>

        <div className={cn('grid grid-cols-1 gap-3 sm:grid-cols-2', typeClass.body)}>
          <div className={walletDialogSectionClass}>
            <span className={typeToneClass.muted}>Quantity</span>
            <span className={typeClass.bodyStrong}>
              {formatPositionShares(investment.shares, investment.type)} {investment.ticker}
            </span>
          </div>
          <div className={walletDialogSectionClass}>
            <span className={typeToneClass.muted}>Average price</span>
            <span className={typeClass.bodyStrong}>
              {formatWalletAmount(investment.avgPrice, amountOpts)}
            </span>
          </div>
        </div>

        <div className={cn(walletDialogSectionClass, typeClass.caption, typeToneClass.muted)}>
          Position quantity and pricing are ledger-controlled. Use Buy/Sell for trades or
          Register position for manual entries.
        </div>

        <div className={walletDialogActionsClass}>
          <div className={cn(walletDialogPrimaryActionsClass, 'sm:flex-wrap')}>
            <Button type="button" variant="secondary" disabled={saving} onClick={onClose} className="flex-1 sm:flex-none sm:min-w-[7.5rem]">
              Cancel
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
      </div>
    </NativeDialog>
  );
}
