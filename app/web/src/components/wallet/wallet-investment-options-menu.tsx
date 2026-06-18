'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { TbDotsVertical } from 'react-icons/tb';
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
  disabled?: boolean;
  compact?: boolean;
  onRegister?: () => void;
  onSell?: () => void;
  canSell?: boolean;
  hasPosition?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
};

const menuItemClass = cn(
  'block w-full px-3 py-2 text-left hover:bg-layer2-half disabled:cursor-not-allowed disabled:opacity-40',
  typeClass.body,
);

export function WalletInvestmentOptionsMenu({
  ticker,
  disabled = false,
  compact = false,
  onRegister,
  onSell,
  canSell = false,
  hasPosition = false,
  onEdit,
  onDelete,
}: WalletInvestmentOptionsMenuProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { open, setOpen, menuPosition, triggerRef } = useAnchoredMenu({
    menuDataAttribute: 'data-wallet-investment-options-menu',
  });

  const menuItems = [
    onSell
      ? {
          key: 'sell',
          label: 'Sell',
          tone: typeToneClass.accent,
          disabled: !canSell,
          onClick: () => {
            if (!canSell) return;
            setOpen(false);
            onSell();
          },
        }
      : null,
    onRegister
      ? {
          key: 'register',
          label: 'Register',
          tone: typeToneClass.accent,
          disabled: hasPosition,
          onClick: () => {
            if (hasPosition) return;
            setOpen(false);
            onRegister();
          },
        }
      : null,
    onEdit
      ? {
          key: 'edit',
          label: 'Edit',
          tone: typeToneClass.default,
          disabled: false,
          onClick: () => {
            setOpen(false);
            onEdit();
          },
        }
      : null,
    onDelete
      ? {
          key: 'exclude',
          label: 'Exclude',
          tone: typeToneClass.accent,
          disabled: false,
          onClick: () => {
            setOpen(false);
            setDeleteOpen(true);
          },
        }
      : null,
  ].filter(Boolean) as Array<{
    key: string;
    label: string;
    tone: string;
    disabled: boolean;
    onClick: () => void;
  }>;

  const menu =
    open && menuPosition && menuItems.length > 0 && typeof document !== 'undefined'
      ? createPortal(
          <div
            data-wallet-investment-options-menu
            className="fixed z-50 min-w-36 overflow-hidden rounded-md border border-layer2-half bg-layer1 shadow-lg"
            style={{ top: menuPosition.top, left: menuPosition.left }}
          >
            {menuItems.map((item) => (
              <button
                key={item.key}
                type="button"
                disabled={item.disabled}
                className={cn(menuItemClass, item.tone)}
                onClick={item.onClick}
              >
                {item.label}
              </button>
            ))}
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
        disabled={disabled || menuItems.length === 0}
        className={cn(
          'inline-flex shrink-0 items-center justify-center rounded-md transition disabled:opacity-50',
          compact
            ? 'h-7 w-7 text-text/50 hover:bg-layer2 hover:text-text'
            : 'h-[2.7rem] w-[2.7rem] bg-layer2-half text-text/70 disabled:opacity-60',
        )}
        onClick={() => setOpen((value) => !value)}
      >
        {compact ? (
          <TbDotsVertical className="h-3.5 w-3.5" aria-hidden />
        ) : (
          <span className={cn(typeClass.title, 'leading-none')}>···</span>
        )}
      </button>

      {menu}

      {onDelete ? (
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
                <Button type="submit" variant="destructive" disabled={disabled} className="flex-1">
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
      ) : null}
    </>
  );
}
