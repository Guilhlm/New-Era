'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { TbDotsVertical } from 'react-icons/tb';
import { MONTHLY_EXPENSES_COPY as copy } from '@/components/monthly-expenses/monthly-expenses-copy';
import type { CreditCardVm } from '@/components/monthly-expenses/monthly-expenses-credit-cards.types';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/cn';
import { NativeDialog } from '@/components/ui/native-dialog';
import { useAnchoredMenu } from '@/hooks/use-anchored-menu';
import { typeClass, typeToneClass } from '@/lib/typography';

type CreditCardOptionsMenuProps = {
  card: CreditCardVm;
  disabled?: boolean;
  onEdit: () => void;
  onDelete: () => Promise<unknown> | unknown;
};

export function CreditCardOptionsMenu({
  card,
  disabled,
  onEdit,
  onDelete,
}: CreditCardOptionsMenuProps) {
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
              {copy.edit}
            </button>
            <button
              type="button"
              className={cn('block w-full px-3 py-2 text-left hover:bg-layer2-half', typeClass.body, typeToneClass.accent)}
              onClick={() => {
                setOpen(false);
                setDeleteOpen(true);
              }}
            >
              {copy.delete}
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
        aria-label={`Opções do cartão ${card.lastFour}`}
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
          onSubmit={async (event) => {
            event.preventDefault();
            await onDelete();
            setDeleteOpen(false);
          }}
        >
          <div>
            <p className={cn(typeClass.title, typeToneClass.default)}>{copy.deleteCard}</p>
            <p className={cn('mt-2', typeClass.body, typeToneClass.muted60)}>{copy.deleteCardHint}</p>
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="destructive" size="sm" disabled={disabled} className="flex-1">
              {copy.delete}
            </Button>
            <Button type="button" variant="secondary" size="sm" className="flex-1" onClick={() => setDeleteOpen(false)}>
              {copy.cancel}
            </Button>
          </div>
        </form>
      </NativeDialog>
    </>
  );
}
