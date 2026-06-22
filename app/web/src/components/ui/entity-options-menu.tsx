'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { TbDotsVertical } from 'react-icons/tb';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/cn';
import { NativeDialog } from '@/components/ui/native-dialog';
import { useAnchoredMenu } from '@/hooks/use-anchored-menu';
import { typeClass, typeToneClass } from '@/lib/typography';
import { walletDialogFieldClass, walletDialogSelectClass } from '@/components/wallet/wallet-dialog-layout';

export type EntityOptionsMenuLabels = {
  triggerAriaLabel: string;
  rename: string;
  delete: string;
  renameTitle: string;
  deleteTitle: string;
  deleteDescription: (entityName: string) => string;
  save: string;
  cancel: string;
  confirmDelete: string;
};

export type EntityOptionsMenuExtraAction = {
  label: string;
  onClick: () => void;
};

type EntityOptionsMenuProps = {
  entityName: string;
  onRename: (name: string) => void;
  onDelete: () => void;
  disabled?: boolean;
  compact?: boolean;
  fullWidth?: boolean;
  triggerLabel?: string;
  labels: EntityOptionsMenuLabels;
  extraActions?: EntityOptionsMenuExtraAction[];
};

export function EntityOptionsMenu({
  entityName,
  onRename,
  onDelete,
  disabled = false,
  compact = false,
  fullWidth = false,
  triggerLabel,
  labels,
  extraActions,
}: EntityOptionsMenuProps) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [draftName, setDraftName] = useState(entityName);
  const { open, setOpen, menuPosition, triggerRef } = useAnchoredMenu({
    menuDataAttribute: 'data-entity-options-menu',
  });

  const menu =
    open && menuPosition && typeof document !== 'undefined'
      ? createPortal(
          <div
            data-entity-options-menu
            className="fixed z-50 min-w-36 overflow-hidden rounded-md border border-layer2-half bg-layer1 shadow-lg"
            style={{ top: menuPosition.top, left: menuPosition.left }}
          >
            <button
              type="button"
              className={cn('block w-full px-3 py-2 text-left hover:bg-layer2-half', typeClass.body, typeToneClass.default)}
              onClick={() => {
                setOpen(false);
                setDraftName(entityName);
                setRenameOpen(true);
              }}
            >
              {labels.rename}
            </button>
            {extraActions?.map((action) => (
              <button
                key={action.label}
                type="button"
                className={cn('block w-full px-3 py-2 text-left hover:bg-layer2-half', typeClass.body, typeToneClass.default)}
                onClick={() => {
                  setOpen(false);
                  action.onClick();
                }}
              >
                {action.label}
              </button>
            ))}
            <button
              type="button"
              className={cn('block w-full px-3 py-2 text-left hover:bg-layer2-half', typeClass.body, typeToneClass.accent)}
              onClick={() => {
                setOpen(false);
                setDeleteOpen(true);
              }}
            >
              {labels.delete}
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
        aria-label={labels.triggerAriaLabel}
        disabled={disabled}
        className={cn(
          'inline-flex shrink-0 items-center justify-center transition disabled:opacity-50',
          fullWidth &&
            cn(
              'h-8 w-full gap-1.5 rounded-[5px] bg-layer2-half hover:bg-layer2',
              typeClass.micro,
              typeToneClass.muted60,
            ),
          compact && !fullWidth && 'h-7 w-7 rounded-md text-text/50 hover:bg-layer2 hover:text-text',
          !compact && !fullWidth && 'h-[2.7rem] w-[2.7rem] rounded-md bg-layer2-half text-text/70 disabled:opacity-60',
        )}
        onClick={() => setOpen((value) => !value)}
      >
        {fullWidth && triggerLabel ? (
          <>
            <TbDotsVertical className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {triggerLabel}
          </>
        ) : compact ? (
          <TbDotsVertical className="h-3.5 w-3.5" aria-hidden />
        ) : (
          <span className={cn(typeClass.title, 'leading-none')}>···</span>
        )}
      </button>

      {menu}

      <NativeDialog open={renameOpen} onClose={() => setRenameOpen(false)}>
        <form
          method="dialog"
          className="flex flex-col gap-4 p-5"
          onSubmit={(event) => {
            event.preventDefault();
            const trimmed = draftName.trim();
            if (trimmed) {
              onRename(trimmed);
              setRenameOpen(false);
            }
          }}
        >
          <p className={cn(typeClass.title, typeToneClass.default)}>{labels.renameTitle}</p>
          <label className={walletDialogFieldClass}>
            <input
              type="text"
              value={draftName}
              disabled={disabled}
              className={cn('w-full disabled:opacity-60', walletDialogSelectClass, typeClass.body, typeToneClass.default)}
              onChange={(event) => setDraftName(event.target.value)}
            />
          </label>
          <div className="flex gap-2">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={disabled || !draftName.trim()}
              className="flex-1"
            >
              {labels.save}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={() => setRenameOpen(false)}
            >
              {labels.cancel}
            </Button>
          </div>
        </form>
      </NativeDialog>

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
            <p className={cn(typeClass.title, typeToneClass.default)}>{labels.deleteTitle}</p>
            <p className={cn('mt-2', typeClass.body, typeToneClass.muted60)}>{labels.deleteDescription(entityName)}</p>
          </div>
          <div className="flex gap-2">
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              disabled={disabled}
              className="flex-1"
            >
              {labels.confirmDelete}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={disabled}
              onClick={() => setDeleteOpen(false)}
            >
              {labels.cancel}
            </Button>
          </div>
        </form>
      </NativeDialog>
    </>
  );
}
