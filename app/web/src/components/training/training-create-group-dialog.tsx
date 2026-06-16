'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';
import { CreateEntityDialog } from '@/components/ui/create-entity-dialog';

type CreateGroupFormProps = {
  saving: boolean;
  onCreate: (name: string, timeMinutes: number | null) => void;
  onClose: () => void;
};

function CreateGroupForm({ saving, onCreate, onClose }: CreateGroupFormProps) {
  const [name, setName] = useState('');
  const [timeMinutes, setTimeMinutes] = useState('40');

  return (
    <form
      method="dialog"
      className="flex flex-col gap-4 p-5"
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = name.trim();
        if (trimmed) {
          const minutes = timeMinutes === '' ? null : Number(timeMinutes);
          onCreate(trimmed, Number.isFinite(minutes) ? minutes : null);
        }
      }}
    >
      <div>
        <p className={cn(typeClass.title, typeToneClass.default)}>New muscle group</p>
        <p className={cn('mt-1', typeClass.body, typeToneClass.muted60)}>Add a group for the current workout day.</p>
      </div>

      <input
        type="text"
        autoFocus
        disabled={saving}
        value={name}
        placeholder="Chest Exercicies"
        className="rounded-md bg-layer2 px-3 py-2 text-text outline-none placeholder:text-text/40 focus-visible:ring-2 focus-visible:ring-red/60"
        onChange={(event) => setName(event.target.value)}
      />

      <label className={cn('flex flex-col gap-2', typeClass.body)}>
        <span className="text-text/60">Duration (minutes)</span>
        <input
          type="text"
          inputMode="numeric"
          disabled={saving}
          value={timeMinutes}
          className="rounded-md bg-layer2 px-3 py-2 text-text outline-none focus-visible:ring-2 focus-visible:ring-red/60"
          onChange={(event) => {
            if (/^\d*$/.test(event.target.value)) setTimeMinutes(event.target.value);
          }}
        />
      </label>

      <div className="flex items-center gap-2">
        <Button type="submit" variant="primary" size="sm" disabled={saving || !name.trim()} className="flex-1">
          {saving ? 'Creating…' : 'Create Group'}
        </Button>
        <Button
          type="button"
          variant="primary"
          size="sm"
          disabled={saving}
          className={cn('bg-layer2 text-text hover:bg-layer2-half')}
          onClick={onClose}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

type TrainingCreateGroupDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, timeMinutes: number | null) => void;
  saving?: boolean;
};

export function TrainingCreateGroupDialog({
  open,
  onClose,
  onCreate,
  saving = false,
}: TrainingCreateGroupDialogProps) {
  return (
    <CreateEntityDialog open={open} onClose={onClose} formKey="create-group">
      <CreateGroupForm saving={saving} onCreate={onCreate} onClose={onClose} />
    </CreateEntityDialog>
  );
}
