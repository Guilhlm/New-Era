'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/cn';
import { NativeDialog } from '@/components/ui/native-dialog';
import { useAnchoredMenu } from '@/hooks/use-anchored-menu';
import { typeClass, typeToneClass } from '@/lib/typography';

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

type EntityOptionsMenuProps = {
  entityName: string;
  onRename: (name: string) => void;
  onDelete: () => void;
  disabled?: boolean;
  labels: EntityOptionsMenuLabels;
};

export function EntityOptionsMenu({
  entityName,
  onRename,
  onDelete,
  disabled = false,
  labels,
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
        className="inline-flex h-[2.7rem] w-[2.7rem] shrink-0 items-center justify-center rounded-md bg-layer2-half text-text/70 disabled:opacity-60"
        onClick={() => setOpen((value) => !value)}
      >
        <span className={cn(typeClass.title, 'leading-none')}>···</span>
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
          <input
            type="text"
            value={draftName}
            disabled={disabled}
            className={cn('rounded-md bg-layer2 px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-red/60', typeClass.body, typeToneClass.default)}
            onChange={(event) => setDraftName(event.target.value)}
          />
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
