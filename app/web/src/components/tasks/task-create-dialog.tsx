'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';
import { CreateEntityDialog } from '@/components/ui/create-entity-dialog';

type CreateTaskFormProps = {
  saving: boolean;
  onCreate: (title: string, scheduledAt: string) => void;
  onClose: () => void;
};

function CreateTaskForm({ saving, onCreate, onClose }: CreateTaskFormProps) {
  const [title, setTitle] = useState('');
  const [scheduledAt, setScheduledAt] = useState('09:00');

  return (
    <form
      method="dialog"
      className="flex flex-col gap-4 p-5"
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = title.trim();
        if (trimmed && scheduledAt) onCreate(trimmed, scheduledAt);
      }}
    >
      <div>
        <p className={cn(typeClass.title, typeToneClass.default)}>New task</p>
        <p className={cn('mt-1', typeClass.body, typeToneClass.muted60)}>Add a manual reminder for this weekday.</p>
      </div>

      <input
        type="text"
        autoFocus
        disabled={saving}
        value={title}
        placeholder="Workout, meal prep…"
        className="rounded-md bg-layer2 px-3 py-2 text-text outline-none placeholder:text-text/40 focus-visible:ring-2 focus-visible:ring-red/60"
        onChange={(event) => setTitle(event.target.value)}
      />

      <label className={cn('flex flex-col gap-2', typeClass.body)}>
        <span className="text-text/60">Time</span>
        <input
          type="time"
          disabled={saving}
          value={scheduledAt}
          className="rounded-md bg-layer2 px-3 py-2 text-text outline-none focus-visible:ring-2 focus-visible:ring-red/60"
          onChange={(event) => setScheduledAt(event.target.value)}
        />
      </label>

      <div className="flex items-center gap-2">
        <Button type="submit" variant="primary" size="sm" disabled={saving || !title.trim()} className="flex-1">
          {saving ? 'Creating…' : 'Create task'}
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

type TaskCreateDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (title: string, scheduledAt: string) => void;
  saving?: boolean;
};

export function TaskCreateDialog({ open, onClose, onCreate, saving = false }: TaskCreateDialogProps) {
  return (
    <CreateEntityDialog open={open} onClose={onClose} formKey="create-task">
      <CreateTaskForm saving={saving} onCreate={onCreate} onClose={onClose} />
    </CreateEntityDialog>
  );
}
