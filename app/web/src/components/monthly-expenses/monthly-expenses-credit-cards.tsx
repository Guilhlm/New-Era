'use client';

import { useState } from 'react';
import { TbPlus } from 'react-icons/tb';
import {
  CreditCardDetailsPanel,
  CreditCardEmptyDetailsPanel,
} from '@/components/monthly-expenses/credit-card-details-panel';
import { CreditCardOptionsMenu } from '@/components/monthly-expenses/credit-card-options-menu';
import { CreditCardStack } from '@/components/monthly-expenses/credit-card-stack';
import { MONTHLY_EXPENSES_COPY as copy } from '@/components/monthly-expenses/monthly-expenses-copy';
import { MonthlyExpensesCreditCardDialog } from '@/components/monthly-expenses/monthly-expenses-credit-card-dialog';
import type { CreditCardCreateInput, CreditCardUpdateInput, CreditCardVm } from '@/components/monthly-expenses/monthly-expenses-credit-cards.types';
import { isMutationError } from '@/hooks/use-dashboard-mutation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';
import { dashboardMainBodyCardPaddingClass } from '@/components/ui/dashboard-two-column-layout';
import { typeClass, typeToneClass } from '@/lib/typography';

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

  const handleSubmitCard = async (values: CreditCardCreateInput) => {
    const result =
      dialogMode === 'edit' && activeCard
        ? await onUpdateCard(activeCard.id, values)
        : await onCreateCard(values);
    if (isMutationError(result)) return;
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
          <h2 className={cn(typeClass.title, typeToneClass.default)}>{copy.myCards}</h2>
          <div className="flex shrink-0 items-center gap-1.5">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              aria-label={copy.switchCard}
              disabled={saving || cards.length <= 1}
              className="h-8 shrink-0 justify-center gap-1 px-3"
              onClick={handleSwitch}
            >
              {copy.switchCard}
            </Button>
            {activeCard ? (
              <CreditCardOptionsMenu
                card={activeCard}
                disabled={saving}
                onEdit={openEditDialog}
                onDelete={async () => {
                  const result = await onDeleteCard(activeCard.id);
                  if (isMutationError(result)) return;
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
              {copy.addCard}
            </Button>
          </div>
        </div>

        {activeCard ? (
          <div className="flex min-h-0 flex-1 items-start gap-10 lg:gap-12">
            <CreditCardStack
              frontCard={activeCard}
              backCard={backCard}
              saving={saving}
              salaryRemaining={salaryRemaining}
              onPayInvoice={onPayInvoice}
            />
            <CreditCardDetailsPanel card={activeCard} stackPeek={Boolean(backCard)} />
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 items-start gap-10 lg:gap-12">
            <div className="flex h-[11rem] w-[16rem] shrink-0 items-center justify-center rounded-2xl bg-layer2-half ring-1 ring-grey/60">
              <p className={cn('px-5 text-center', typeClass.caption, typeToneClass.muted60)}>
                {copy.noCards}
              </p>
            </div>
            <CreditCardEmptyDetailsPanel />
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
