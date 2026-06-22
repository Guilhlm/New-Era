'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { TbCreditCard, TbDotsVertical, TbPlus, TbReceipt } from 'react-icons/tb';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';
import { NativeDialog } from '@/components/ui/native-dialog';
import { dashboardMainBodyCardPaddingClass } from '@/components/ui/dashboard-two-column-layout';
import { MonthlyExpensesCreditCardDialog } from '@/components/monthly-expenses/monthly-expenses-credit-card-dialog';
import type { CreditCardCreateInput, CreditCardUpdateInput, CreditCardVm } from '@/components/monthly-expenses/monthly-expenses-credit-cards.types';
import { CreditCardDecor } from '@/components/monthly-expenses/credit-card-decor';
import {
  creditCardBackgroundStyle,
  creditCardTextTone,
  isLightCardColor,
} from '@/components/monthly-expenses/credit-card-visual';
import { useAnchoredMenu } from '@/hooks/use-anchored-menu';
import { typeClass, typeToneClass } from '@/lib/typography';
import { formatBrlAmount } from '@/utils/wallet';

type MonthlyExpensesCreditCardsProps = {
  cards: CreditCardVm[];
  onCreateCard: (values: CreditCardCreateInput) => Promise<unknown> | unknown;
  onUpdateCard: (id: string, values: CreditCardUpdateInput) => Promise<unknown> | unknown;
  onDeleteCard: (id: string) => Promise<unknown> | unknown;
  onPayInvoice: (id: string) => Promise<unknown> | unknown;
  salaryRemaining: number;
  saving?: boolean;
  className?: string;
};

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

function CardStack({
  frontCard,
  backCard,
  saving,
  salaryRemaining,
  onPayInvoice,
}: {
  frontCard: CreditCardVm;
  backCard?: CreditCardVm;
  saving?: boolean;
  salaryRemaining: number;
  onPayInvoice: (id: string) => Promise<unknown> | unknown;
}) {
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
              Current invoice
            </p>
          ) : (
            <CardChip tone={tone} />
          )}
          <BrandMark brand={frontCard.brand} light={lightCard} />
        </div>

        {showInvoice ? (
          <div className="mt-auto space-y-1 pb-0.5">
            <p className={cn('tabular-nums', typeClass.title, tone.primary)}>
              {invoice ? formatBrlAmount(invoice.amount) : 'No invoice'}
            </p>
            <p className={cn(typeClass.caption, tone.muted)}>
              {invoice ? `Due ${formatDueDate(invoice.dueDate)}` : `Due day ${frontCard.dueDay}`}
            </p>
            {invoiceOpen && !canPayInvoice ? (
              <p className={cn(typeClass.micro, tone.muted)}>Above salary available.</p>
            ) : null}
            {invoice ? (
              <button
                type="button"
                disabled={saving || !canPayInvoice}
                className={cn(
                  'mt-2 rounded-md px-3 py-1.5 ring-1 transition disabled:cursor-not-allowed disabled:opacity-45',
                  typeClass.micro,
                  tone.action,
                  lightCard ? 'ring-black/8' : 'ring-white/12',
                )}
                onClick={(event) => {
                  event.stopPropagation();
                  if (!invoiceOpen) return;
                  void onPayInvoice(invoice.id);
                }}
              >
                {invoice.status === 'paid' ? 'Paid' : 'Pay invoice'}
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
          aria-label={invoice ? (showInvoice ? 'Show card front' : 'Show card invoice') : 'Show card invoice'}
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

function formatCardInfoLabel(card: CreditCardVm) {
  const brandLabel = card.brand === 'mastercard' ? 'Mastercard' : 'Visa';
  return `**** ${card.lastFour} - ${brandLabel}`;
}

function formatDueDate(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit' });
}

function CardDetails({
  card,
  stackPeek = false,
}: {
  card: CreditCardVm;
  stackPeek?: boolean;
}) {
  const usedPct = Math.min(100, Math.round((card.used / card.limit) * 100));

  return (
    <div className={cn('flex min-w-0 flex-1 flex-col justify-start gap-5', stackPeek && 'pt-3')}>
      <div className="space-y-1">
        <p className={cn('uppercase tracking-wider', typeClass.overline, typeToneClass.muted60)}>Selected card</p>
        <p className={cn('truncate', typeClass.title, typeToneClass.default)}>{formatCardInfoLabel(card)}</p>
      </div>

      <div className="flex min-w-0 flex-col rounded-[5px] bg-layer2-half px-4 py-3.5">
        <div className="flex items-start justify-between gap-3">
          <p className={cn('uppercase tracking-wider', typeClass.overline, typeToneClass.muted60)}>Limite usado</p>
          <p className={cn('shrink-0 tabular-nums', typeClass.title, typeToneClass.default)}>{usedPct}%</p>
        </div>

        <div className={cn('mt-2 flex min-w-0 items-center justify-between gap-3', typeClass.caption)}>
          <span className={cn('min-w-0 truncate tabular-nums', typeToneClass.default)}>
            {formatBrlAmount(card.used)}
          </span>
          <span className={cn('min-w-0 truncate text-right tabular-nums', typeClass.body, 'text-text/75')}>
            de {formatBrlAmount(card.limit)}
          </span>
        </div>

        <div className="mt-3 h-2.5 w-full shrink-0 rounded-full bg-layer2">
          <div className="h-2.5 rounded-full bg-green" style={{ width: `${usedPct}%` }} aria-hidden />
        </div>
      </div>
    </div>
  );
}

function CardOptionsMenu({
  card,
  disabled,
  onEdit,
  onDelete,
}: {
  card: CreditCardVm;
  disabled?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { open, setOpen, menuPosition, triggerRef } = useAnchoredMenu({
    menuDataAttribute: 'data-monthly-card-options-menu',
  });
  const menu =
    open && menuPosition && typeof document !== 'undefined'
      ? createPortal(
          <div
            data-monthly-card-options-menu
            className="fixed z-50 min-w-36 overflow-hidden rounded-md border border-layer2-half bg-layer1 shadow-lg"
            style={{ top: menuPosition.top, left: menuPosition.left }}
          >
            <button
              type="button"
              className={cn('block w-full px-3 py-2 text-left hover:bg-layer2-half', typeClass.body, typeToneClass.default)}
              onClick={() => {
                setOpen(false);
                onEdit();
              }}
            >
              Edit
            </button>
            <button
              type="button"
              className={cn('block w-full px-3 py-2 text-left hover:bg-layer2-half', typeClass.body, typeToneClass.accent)}
              onClick={() => {
                setOpen(false);
                setDeleteOpen(true);
              }}
            >
              Delete
            </button>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <Button
        ref={triggerRef}
        type="button"
        variant="secondary"
        size="sm"
        aria-label={`Card options ${card.lastFour}`}
        disabled={disabled}
        className="h-8 shrink-0 justify-center gap-1 px-3"
        onClick={() => setOpen((value) => !value)}
      >
        <TbDotsVertical className="h-3.5 w-3.5 shrink-0" aria-hidden />
      </Button>
      {menu}
      <NativeDialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <form
          method="dialog"
          className="flex flex-col gap-4 p-5"
          onSubmit={(event) => {
            event.preventDefault();
            onDelete();
            setDeleteOpen(false);
          }}
        >
          <div>
            <p className={cn(typeClass.title, typeToneClass.default)}>Delete card</p>
            <p className={cn('mt-2', typeClass.body, typeToneClass.muted60)}>
              Transactions for this card will be kept as Cash and the limit will be removed from the budget.
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="destructive" size="sm" disabled={disabled} className="flex-1">
              Delete
            </Button>
            <Button type="button" variant="secondary" size="sm" className="flex-1" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </NativeDialog>
    </>
  );
}

export function MonthlyExpensesCreditCards({
  cards,
  onCreateCard,
  onUpdateCard,
  onDeleteCard,
  onPayInvoice,
  salaryRemaining,
  saving = false,
  className,
}: MonthlyExpensesCreditCardsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const safeIndex = cards.length === 0 ? 0 : Math.min(activeIndex, cards.length - 1);
  const activeCard = cards[safeIndex] ?? cards[0];
  const backCard = cards.length > 1 ? cards[(safeIndex + 1) % cards.length] : undefined;

  const openCreateDialog = () => {
    setDialogMode('create');
    setDialogOpen(true);
  };

  const openEditDialog = () => {
    if (!activeCard) return;
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleSubmitCard = (values: CreditCardCreateInput) => {
    if (dialogMode === 'edit' && activeCard) {
      void onUpdateCard(activeCard.id, values);
    } else {
      void onCreateCard(values);
    }
    setDialogOpen(false);
  };

  const handleSwitch = () => {
    if (cards.length <= 1) return;
    setActiveIndex((index) => (index + 1) % cards.length);
  };

  return (
    <>
      <Card
        className={cn(
          'flex h-full min-h-0 max-h-[19rem] shrink-0 flex-col gap-4 overflow-hidden',
          dashboardMainBodyCardPaddingClass,
          className,
        )}
      >
        <div className="flex shrink-0 items-start justify-between gap-3">
          <h2 className={cn(typeClass.title, typeToneClass.default)}>My Cards</h2>
          <div className="flex shrink-0 items-center gap-1.5">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              aria-label="Switch card"
              disabled={saving || cards.length <= 1}
              className="h-8 shrink-0 justify-center gap-1 px-3"
              onClick={handleSwitch}
            >
              Switch card
            </Button>
            {activeCard ? (
              <CardOptionsMenu
                card={activeCard}
                disabled={saving}
                onEdit={openEditDialog}
                onDelete={() => {
                  void onDeleteCard(activeCard.id);
                  setActiveIndex((index) => Math.max(0, index - 1));
                }}
              />
            ) : null}
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={saving}
              className="h-8 gap-1 px-3"
              onClick={openCreateDialog}
            >
              <TbPlus className="h-3.5 w-3.5" aria-hidden />
              Add Card
            </Button>
          </div>
        </div>

        {activeCard ? (
          <div className="flex min-h-0 flex-1 items-start gap-10 lg:gap-12">
            <CardStack
              frontCard={activeCard}
              backCard={backCard}
              saving={saving}
              salaryRemaining={salaryRemaining}
              onPayInvoice={onPayInvoice}
            />

            <CardDetails
              card={activeCard}
              stackPeek={Boolean(backCard)}
            />
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 items-start gap-10 lg:gap-12">
            <div className="flex h-[11rem] w-[16rem] shrink-0 items-center justify-center rounded-2xl bg-layer2-half ring-1 ring-grey/60">
              <p className={cn('px-5 text-center', typeClass.caption, typeToneClass.muted60)}>
                No cards registered
              </p>
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-start gap-5">
              <div className="space-y-1">
                <p className={cn('uppercase tracking-wider', typeClass.overline, typeToneClass.muted60)}>
                  Selected card
                </p>
                <p className={cn('truncate', typeClass.title, typeToneClass.default)}>
                  Add your first card
                </p>
              </div>
              <div className="flex min-w-0 flex-col rounded-[5px] bg-layer2-half px-4 py-3.5">
                <p className={cn(typeClass.caption, typeToneClass.muted60)}>
                  Use the Add Card button to track limit and monthly usage.
                </p>
                <div className="mt-3 h-2.5 w-full shrink-0 rounded-full bg-layer2" />
              </div>
            </div>
          </div>
        )}
      </Card>

      <MonthlyExpensesCreditCardDialog
        open={dialogOpen}
        mode={dialogMode}
        initialCard={dialogMode === 'edit' ? activeCard : null}
        saving={saving}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmitCard}
      />
    </>
  );
}
export type { CreditCardVm } from '@/components/monthly-expenses/monthly-expenses-credit-cards.types';

