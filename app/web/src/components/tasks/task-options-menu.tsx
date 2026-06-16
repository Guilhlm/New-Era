'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/cn';
import { NativeDialog } from '@/components/ui/native-dialog';
import { useAnchoredMenu } from '@/hooks/use-anchored-menu';
import { typeClass, typeToneClass } from '@/lib/typography';

type TaskOptionsMenuProps = {
  taskTitle: string;
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
};

export function TaskOptionsMenu({
  taskTitle,
  onEdit,
  onDelete,
  disabled = false,
}: TaskOptionsMenuProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { open, setOpen, menuPosition, triggerRef } = useAnchoredMenu({
    menuDataAttribute: 'data-task-options-menu',
  });

  const menu =
    open && menuPosition && typeof document !== 'undefined'
      ? createPortal(
          <div
            data-task-options-menu
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
              Delete
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
        aria-label="Task options"
        disabled={disabled}
        className="inline-flex h-[2.7rem] w-[2.7rem] shrink-0 items-center justify-center rounded-md bg-layer2-half text-text/70 disabled:opacity-60"
        onClick={() => setOpen((value) => !value)}
      >
        <span className={cn(typeClass.title, 'leading-none')}>···</span>
      </button>

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
            <p className={cn(typeClass.title, typeToneClass.default)}>Delete task</p>
            <p className={cn('mt-2', typeClass.body, typeToneClass.muted60)}>
              Are you sure you want to delete {taskTitle}?
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              disabled={disabled}
              className="flex-1"
            >
              Delete
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={disabled}
              onClick={() => setDeleteOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </NativeDialog>
    </>
  );
}
