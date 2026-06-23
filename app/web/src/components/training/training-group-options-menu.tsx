'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/cn';
import { NativeDialog } from '@/components/ui/native-dialog';
import { useAnchoredMenu } from '@/hooks/use-anchored-menu';
import { typeClass, typeToneClass } from '@/lib/typography';

type TrainingGroupOptionsMenuProps = {
  groupName: string;
  timeMinutes: number | null;
  onEdit: (name: string, timeMinutes: number | null) => void;
  onDelete: () => void;
  disabled?: boolean;
};

function formatTimeDraft(timeMinutes: number | null) {
  return timeMinutes === null ? '' : String(timeMinutes);
}

export function TrainingGroupOptionsMenu({
  groupName,
  timeMinutes,
  onEdit,
  onDelete,
  disabled = false,
}: TrainingGroupOptionsMenuProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [draftName, setDraftName] = useState(groupName);
  const [draftTimeMinutes, setDraftTimeMinutes] = useState(formatTimeDraft(timeMinutes));
  const { open, setOpen, menuPosition, triggerRef } = useAnchoredMenu({
    menuDataAttribute: 'data-training-group-options-menu',
  });

  function openEditDialog() {
    setOpen(false);
    setDraftName(groupName);
    setDraftTimeMinutes(formatTimeDraft(timeMinutes));
    setEditOpen(true);
  }

  const menu =
    open && menuPosition && typeof document !== 'undefined'
      ? createPortal(
          <div
            data-training-group-options-menu
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
              onClick={openEditDialog}
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
              Delete group
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
        aria-label="Group options"
        disabled={disabled}
        className="inline-flex h-[2.7rem] w-[2.7rem] shrink-0 items-center justify-center rounded-md bg-layer2-half text-text/70 transition disabled:opacity-60"
        onClick={() => setOpen((value) => !value)}
      >
        <span className={cn(typeClass.title, 'leading-none')}>···</span>
      </button>

      {menu}

      <NativeDialog open={editOpen} onClose={() => setEditOpen(false)}>
        <form
          method="dialog"
          className="flex flex-col gap-4 p-5"
          onSubmit={(event) => {
            event.preventDefault();
            const trimmed = draftName.trim();
            if (!trimmed) return;

            const minutes =
              draftTimeMinutes === '' ? null : Number(draftTimeMinutes);
            onEdit(trimmed, Number.isFinite(minutes) ? minutes : null);
            setEditOpen(false);
          }}
        >
          <p className={cn(typeClass.title, typeToneClass.default)}>Edit group</p>

          <input
            type="text"
            autoFocus
            disabled={disabled}
            value={draftName}
            className="rounded-md bg-layer2 px-3 py-2 text-text outline-none placeholder:text-text/40 focus-visible:ring-2 focus-visible:ring-red/60 disabled:opacity-60"
            onChange={(event) => setDraftName(event.target.value)}
          />

          <label className={cn('flex flex-col gap-2', typeClass.body)}>
            <span className="text-text/60">Duration (minutes)</span>
            <input
              type="text"
              inputMode="numeric"
              disabled={disabled}
              value={draftTimeMinutes}
              className="rounded-md bg-layer2 px-3 py-2 text-text outline-none focus-visible:ring-2 focus-visible:ring-red/60 disabled:opacity-60"
              onChange={(event) => {
                if (/^\d*$/.test(event.target.value)) setDraftTimeMinutes(event.target.value);
              }}
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
              Save
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={() => setEditOpen(false)}
            >
              Cancel
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
            <p className={cn(typeClass.title, typeToneClass.default)}>Delete group</p>
            <p className={cn('mt-2', typeClass.body, typeToneClass.muted60)}>
              Are you sure you want to delete {groupName}? Exercises in this group will also be
              removed.
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
