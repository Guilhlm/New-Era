'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/cn';
import { NativeDialog } from '@/components/ui/native-dialog';
import {
  walletDialogActionsClass,
  walletDialogFormClass,
  walletDialogPrimaryActionsClass,
} from '@/components/wallet/wallet-dialog-layout';
import { useAnchoredMenu } from '@/hooks/use-anchored-menu';
import { typeClass, typeToneClass } from '@/lib/typography';

type WalletInvestmentOptionsMenuProps = {
  ticker: string;
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
};

export function WalletInvestmentOptionsMenu({
  ticker,
  onEdit,
  onDelete,
  disabled = false,
}: WalletInvestmentOptionsMenuProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { open, setOpen, menuPosition, triggerRef } = useAnchoredMenu({
    menuDataAttribute: 'data-wallet-investment-options-menu',
  });

  const menu =
    open && menuPosition && typeof document !== 'undefined'
      ? createPortal(
          <div
            data-wallet-investment-options-menu
            className="fixed z-50 min-w-36 overflow-hidden rounded-md border border-layer2-half bg-layer1 shadow-lg"
            style={{ top: menuPosition.top, left: menuPosition.left }}
          >
            <button
              type="button"
              className={cn(
                'block w-full px-3 py-2 text-left hover:bg-layer2-half',
                typeClass.body,
                typeToneClass.default,
              )}
              onClick={() => {
                setOpen(false);
                onEdit();
              }}
            >
              Edit
            </button>
            <button
              type="button"
              className={cn(
                'block w-full px-3 py-2 text-left hover:bg-layer2-half',
                typeClass.body,
                typeToneClass.accent,
              )}
              onClick={() => {
                setOpen(false);
                setDeleteOpen(true);
              }}
            >
              Exclude
            </button>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Options for ${ticker}`}
        disabled={disabled}
        className="inline-flex h-[2.7rem] w-[2.7rem] shrink-0 items-center justify-center rounded-md bg-layer2-half text-text/70 disabled:opacity-60"
        onClick={() => setOpen((value) => !value)}
      >
        <span className={cn(typeClass.title, 'leading-none')}>···</span>
      </button>

      {menu}

      <NativeDialog open={deleteOpen} size="wide" onClose={() => setDeleteOpen(false)}>
        <form
          method="dialog"
          className={walletDialogFormClass}
          onSubmit={(event) => {
            event.preventDefault();
            onDelete();
            setDeleteOpen(false);
          }}
        >
          <div>
            <p className={cn(typeClass.title, typeToneClass.default)}>Exclude investment</p>
            <p className={cn('mt-3', typeClass.body, typeToneClass.muted60)}>
              Are you sure you want to exclude {ticker} from your portfolio?
            </p>
          </div>
          <div className={walletDialogActionsClass}>
            <div className={walletDialogPrimaryActionsClass}>
              <Button
                type="submit"
                variant="destructive"
                disabled={disabled}
                className="flex-1"
              >
                Exclude
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={disabled}
                onClick={() => setDeleteOpen(false)}
                className="flex-1 sm:flex-none sm:min-w-[7.5rem]"
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </NativeDialog>
    </>
  );
}
