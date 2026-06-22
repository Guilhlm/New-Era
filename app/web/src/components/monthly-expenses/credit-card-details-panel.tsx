'use client';

import { MONTHLY_EXPENSES_COPY as copy } from '@/components/monthly-expenses/monthly-expenses-copy';
import type { CreditCardVm } from '@/components/monthly-expenses/monthly-expenses-credit-cards.types';
import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';
import { formatBrlAmount } from '@/utils/wallet';

function formatCardInfoLabel(card: CreditCardVm) {
  const brandLabel = card.brand === 'mastercard' ? 'Mastercard' : 'Visa';
  return `**** ${card.lastFour} - ${brandLabel}`;
}

type CreditCardDetailsPanelProps = {
  card: CreditCardVm;
  stackPeek?: boolean;
};

export function CreditCardDetailsPanel({ card, stackPeek = false }: CreditCardDetailsPanelProps) {
  const usedPct = Math.min(100, Math.round((card.used / card.limit) * 100));

  return (
    <div className={cn('flex min-w-0 flex-1 flex-col justify-start gap-5', stackPeek && 'pt-3')}>
      <div className="space-y-1">
        <p className={cn('uppercase tracking-wider', typeClass.overline, typeToneClass.muted60)}>
          {copy.selectedCard}
        </p>
        <p className={cn('truncate', typeClass.title, typeToneClass.default)}>
          {formatCardInfoLabel(card)}
        </p>
      </div>

      <div className="flex min-w-0 flex-col rounded-[5px] bg-layer2-half px-4 py-3.5">
        <div className="flex items-start justify-between gap-3">
          <p className={cn('uppercase tracking-wider', typeClass.overline, typeToneClass.muted60)}>
            {copy.limitUsed}
          </p>
          <p className={cn('shrink-0 tabular-nums', typeClass.title, typeToneClass.default)}>{usedPct}%</p>
        </div>

        <div className={cn('mt-2 flex min-w-0 items-center justify-between gap-3', typeClass.caption)}>
          <span className={cn('min-w-0 truncate tabular-nums', typeToneClass.default)}>
            {formatBrlAmount(card.used)}
          </span>
          <span className={cn('min-w-0 truncate text-right tabular-nums', typeClass.body, 'text-text/75')}>
            {copy.limitOf(formatBrlAmount(card.limit))}
          </span>
        </div>

        <div className="mt-3 h-2.5 w-full shrink-0 rounded-full bg-layer2">
          <div className="h-2.5 rounded-full bg-green" style={{ width: `${usedPct}%` }} aria-hidden />
        </div>
      </div>
    </div>
  );
}

export function CreditCardEmptyDetailsPanel() {
  return (
    <div className="flex min-w-0 flex-1 flex-col justify-start gap-5">
      <div className="space-y-1">
        <p className={cn('uppercase tracking-wider', typeClass.overline, typeToneClass.muted60)}>
          {copy.selectedCard}
        </p>
        <p className={cn('truncate', typeClass.title, typeToneClass.default)}>{copy.addFirstCard}</p>
      </div>
      <div className="flex min-w-0 flex-col rounded-[5px] bg-layer2-half px-4 py-3.5">
        <p className={cn(typeClass.caption, typeToneClass.muted60)}>{copy.addFirstCardHint}</p>
        <div className="mt-3 h-2.5 w-full shrink-0 rounded-full bg-layer2" />
      </div>
    </div>
  );
}
