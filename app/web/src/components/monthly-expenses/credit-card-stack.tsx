'use client';

import { useState } from 'react';
import { TbCreditCard, TbReceipt } from 'react-icons/tb';
import { MONTHLY_EXPENSES_COPY as copy } from '@/components/monthly-expenses/monthly-expenses-copy';
import type { CreditCardVm } from '@/components/monthly-expenses/monthly-expenses-credit-cards.types';
import { CreditCardDecor } from '@/components/monthly-expenses/credit-card-decor';
import {
  creditCardBackgroundStyle,
  creditCardTextTone,
  isLightCardColor,
} from '@/components/monthly-expenses/credit-card-visual';
import { cn } from '@/components/ui/cn';
import { typeClass } from '@/lib/typography';
import { formatShortDate } from '@/utils/month-key';
import { formatBrlAmount } from '@/utils/wallet';

function BrandMark({ brand, light }: { brand: CreditCardVm['brand']; light?: boolean }) {
  if (brand === 'mastercard') {
    return (
      <div className="flex items-center" aria-hidden>
        <span className="h-[18px] w-[18px] rounded-full bg-[#eb001b]" />
        <span className="-ml-2 h-[18px] w-[18px] rounded-full bg-[#f79e1b]" />
      </div>
    );
  }
  return (
    <span
      className={cn(
        typeClass.label,
        'tracking-[0.22em]',
        light ? 'text-slate-900/80' : 'text-white/88',
      )}
    >
      VISA
    </span>
  );
}

function CardChip({ tone }: { tone: ReturnType<typeof creditCardTextTone> }) {
  return (
    <div
      className={cn(
        'h-7 w-9 shrink-0 rounded-[5px] bg-gradient-to-br shadow-sm ring-1',
        tone.chipLine,
        tone.chipRing,
      )}
      aria-hidden
    >
      <div className="mx-auto mt-[10px] h-px w-5 bg-black/15" />
      <div className="mx-auto mt-1 h-px w-5 bg-black/10" />
      <div className="mx-auto mt-1 h-px w-5 bg-black/10" />
    </div>
  );
}

function CreditCardSurface({
  card,
  className,
  children,
}: {
  card: CreditCardVm;
  className?: string;
  children: React.ReactNode;
}) {
  const tone = creditCardTextTone(card.color);
  const light = isLightCardColor(card.color);

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[14px] shadow-[0_14px_34px_-18px_rgba(0,0,0,0.58)]',
        className,
      )}
      style={creditCardBackgroundStyle(card.color)}
    >
      <CreditCardDecor color={card.color} light={light} />
      <div className={cn('relative z-10 flex h-full flex-col px-5 py-4', tone.primary)}>
        {children}
      </div>
    </div>
  );
}

type CreditCardStackProps = {
  frontCard: CreditCardVm;
  backCard?: CreditCardVm;
  saving?: boolean;
  salaryRemaining: number;
  onPayInvoice: (id: string) => Promise<unknown> | unknown;
};

export function CreditCardStack({
  frontCard,
  backCard,
  saving,
  salaryRemaining,
  onPayInvoice,
}: CreditCardStackProps) {
  const [showInvoice, setShowInvoice] = useState(false);
  const invoice = frontCard.openInvoices?.[0] ?? frontCard.invoice ?? null;
  const invoiceOpen = invoice?.status === 'open';
  const canPayInvoice = Boolean(invoiceOpen && invoice && invoice.amount <= salaryRemaining);
  const tone = creditCardTextTone(frontCard.color);
  const lightCard = isLightCardColor(frontCard.color);

  return (
    <div
      className={cn('relative shrink-0', backCard ? 'h-[calc(11rem+0.75rem)] w-[16rem]' : 'h-[11rem] w-[16rem]')}
    >
      {backCard ? (
        <div className="absolute top-0 left-0 h-[11rem] w-full translate-x-3 opacity-80" aria-hidden>
          <CreditCardSurface card={backCard} className="h-full w-full">
            <span />
          </CreditCardSurface>
        </div>
      ) : null}

      <CreditCardSurface
        card={frontCard}
        className={cn('absolute inset-x-0 h-[11rem]', backCard ? 'top-3' : 'top-0')}
      >
        <div className="flex items-start justify-between gap-3">
          {showInvoice ? (
            <p className={cn('uppercase tracking-[0.16em]', typeClass.overline, tone.muted)}>
              {copy.currentInvoice}
            </p>
          ) : (
            <CardChip tone={tone} />
          )}
          <BrandMark brand={frontCard.brand} light={lightCard} />
        </div>

        {showInvoice ? (
          <div className="mt-auto space-y-1 pb-0.5">
            <p className={cn('tabular-nums', typeClass.title, tone.primary)}>
              {invoice ? formatBrlAmount(invoice.amount) : copy.noInvoice}
            </p>
            <p className={cn(typeClass.caption, tone.muted)}>
              {invoice
                ? copy.dueOn(formatShortDate(invoice.dueDate))
                : copy.dueDay(frontCard.dueDay)}
            </p>
            {invoiceOpen && !canPayInvoice ? (
              <p className={cn(typeClass.micro, tone.muted)}>{copy.aboveSalaryAvailable}</p>
            ) : null}
            {invoice ? (
              <button
                type="button"
                disabled={saving || !canPayInvoice}
                className={cn(
                  'mt-2 rounded-md px-3 py-1.5 ring-1 transition disabled:cursor-not-allowed disabled:opacity-45',
                  typeClass.micro,
                  invoice.status === 'paid'
                    ? tone.action
                    : 'bg-red text-on-accent hover:brightness-110',
                  lightCard ? 'ring-black/8' : 'ring-white/12',
                )}
                onClick={(event) => {
                  event.stopPropagation();
                  if (!invoiceOpen) return;
                  void onPayInvoice(invoice.id);
                }}
              >
                {invoice.status === 'paid' ? copy.paid : copy.payInvoice}
              </button>
            ) : null}
          </div>
        ) : (
          <>
            <div className="mt-7">
              <p
                className={cn(
                  'tabular-nums font-medium tracking-[0.22em]',
                  typeClass.body,
                  tone.secondary,
                )}
              >
                •••• •••• •••• {frontCard.lastFour}
              </p>
            </div>
            <div className="mt-auto pb-0.5">
              <p
                className={cn(
                  'truncate uppercase tracking-[0.14em]',
                  typeClass.micro,
                  tone.muted,
                )}
              >
                {frontCard.holder}
              </p>
            </div>
          </>
        )}

        <button
          type="button"
          aria-label={invoice ? (showInvoice ? copy.showCardFront : copy.showCardInvoice) : copy.showCardInvoice}
          disabled={!invoice}
          className={cn(
            'absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/80 text-white ring-1 ring-white/25 backdrop-blur-md transition hover:bg-black/95',
            invoice ? 'hover:scale-105' : 'cursor-default opacity-45',
          )}
          onClick={() => {
            if (!invoice) return;
            setShowInvoice((value) => !value);
          }}
        >
          {showInvoice ? (
            <TbCreditCard className="h-4 w-4 shrink-0" aria-hidden />
          ) : (
            <TbReceipt className="h-4 w-4 shrink-0" aria-hidden />
          )}
        </button>
      </CreditCardSurface>
    </div>
  );
}
