'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { TbDotsVertical, TbPlus } from 'react-icons/tb';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';
import { NativeDialog } from '@/components/ui/native-dialog';
import { dashboardMainBodyCardPaddingClass } from '@/components/ui/dashboard-two-column-layout';
import { MonthlyExpensesCreditCardDialog } from '@/components/monthly-expenses/monthly-expenses-credit-card-dialog';
import type { CreditCardCreateInput, CreditCardUpdateInput, CreditCardVm } from '@/components/monthly-expenses/monthly-expenses-credit-cards.types';
import { useAnchoredMenu } from '@/hooks/use-anchored-menu';
import { typeClass, typeToneClass } from '@/lib/typography';
import { formatBrlAmount } from '@/utils/wallet';

type MonthlyExpensesCreditCardsProps = {
  cards: CreditCardVm[];
  onCreateCard: (values: CreditCardCreateInput) => Promise<unknown> | unknown;
  onUpdateCard: (id: string, values: CreditCardUpdateInput) => Promise<unknown> | unknown;
  onDeleteCard: (id: string) => Promise<unknown> | unknown;
  saving?: boolean;
  className?: string;
};

function BrandMark({ brand }: { brand: CreditCardVm['brand'] }) {
  if (brand === 'mastercard') {
    return (
      <div className="flex items-center gap-0.5" aria-hidden>
        <span className="h-5 w-5 rounded-full bg-red/90" />
        <span className="-ml-3 h-5 w-5 rounded-full bg-amber-500/80" />
      </div>
    );
  }
  return <span className={cn(typeClass.label, 'tracking-widest text-text/80')}>VISA</span>;
}

function CardStack({
  frontCard,
  backCard,
  onSwitch,
  canSwitch,
}: {
  frontCard: CreditCardVm;
  backCard?: CreditCardVm;
  onSwitch: () => void;
  canSwitch: boolean;
}) {
  return (
    <div
      className={cn('relative shrink-0', backCard ? 'h-[calc(11rem+0.75rem)] w-[16rem]' : 'h-[11rem] w-[16rem]')}
    >
      {backCard ? (
        <div
          className="absolute top-0 left-0 h-[11rem] w-full translate-x-3 rounded-2xl opacity-80"
          style={{ backgroundColor: backCard.color }}
          aria-hidden
        />
      ) : null}

      <div
        className={cn(
          'absolute inset-x-0 h-[11rem] overflow-hidden rounded-2xl px-5 py-4 ring-1',
          backCard ? 'top-3' : 'top-0',
          frontCard.highlighted ? 'ring-red/70' : 'ring-grey/60',
        )}
        style={{ backgroundColor: frontCard.color }}
      >
        <div className="flex items-start justify-between gap-2">
          <BrandMark brand={frontCard.brand} />
          <BrandMark brand="visa" />
        </div>

        <div className="mt-6 space-y-1.5">
          <p className={cn('tracking-[0.18em]', typeClass.body, 'text-on-accent/85')}>
            •••• •••• •••• {frontCard.lastFour}
          </p>
          <p className={cn('truncate uppercase', typeClass.caption, typeToneClass.onAccent)}>{frontCard.holder}</p>
        </div>

        <button
          type="button"
          aria-label="Switch card"
          disabled={!canSwitch}
          className={cn(
            'absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-layer1 text-text/80 shadow-lg ring-2 ring-background/40 transition',
            canSwitch ? 'hover:text-on-accent hover:ring-red' : 'cursor-default opacity-50',
          )}
          onClick={onSwitch}
        >
          <span className={cn(typeClass.bodyStrong)}>⇄</span>
        </button>
      </div>
    </div>
  );
}

function formatCardInfoLabel(card: CreditCardVm) {
  const brandLabel = card.brand === 'mastercard' ? 'Mastercard' : 'Visa';
  return `**** ${card.lastFour} - ${brandLabel}`;
}

function CardDetails({ card, stackPeek = false }: { card: CreditCardVm; stackPeek?: boolean }) {
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
              canSwitch={cards.length > 1}
              onSwitch={handleSwitch}
            />

            <CardDetails card={activeCard} stackPeek={Boolean(backCard)} />
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

