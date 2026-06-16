'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { NativeDialog } from '@/components/ui/native-dialog';
import type { TaskVm } from '@/types/task';

type TaskEditSheetProps = {
  open: boolean;
  task: TaskVm | null;
  saving?: boolean;
  onClose: () => void;
  onSave: (title: string, scheduledAt: string) => void;
  onDelete: () => void;
};

function EditTaskForm({
  task,
  saving,
  onClose,
  onSave,
  onDelete,
}: {
  task: TaskVm;
  saving: boolean;
  onClose: () => void;
  onSave: (title: string, scheduledAt: string) => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(task.title);
  const [scheduledAt, setScheduledAt] = useState(task.scheduledAt);

  return (
    <form
      method="dialog"
      className="flex flex-col gap-4 p-5"
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = title.trim();
        if (trimmed && scheduledAt) onSave(trimmed, scheduledAt);
      }}
    >
      <div>
        <p className="type-title text-text">Edit task</p>
        <p className="type-body mt-1 text-text/60">{task.title}</p>
      </div>

      <label className="type-body flex flex-col gap-2">
        <span className="text-text/60">Title</span>
        <input
          type="text"
          disabled={saving}
          value={title}
          className="rounded-md bg-layer2 px-3 py-2 text-text outline-none focus-visible:ring-2 focus-visible:ring-red/60"
          onChange={(event) => setTitle(event.target.value)}
        />
      </label>

      <label className="type-body flex flex-col gap-2">
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
          {saving ? 'Saving…' : 'Save'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={saving}
          onClick={onClose}
        >
          Cancel
        </Button>
      </div>

      <Button
        type="button"
        variant="destructive"
        size="sm"
        disabled={saving}
        onClick={onDelete}
      >
        Delete task
      </Button>
    </form>
  );
}

export function TaskEditSheet({ open, task, saving = false, onClose, onSave, onDelete }: TaskEditSheetProps) {
  return (
    <NativeDialog open={open} onClose={onClose}>
      {open && task ? (
        <EditTaskForm
          key={task.id}
          task={task}
          saving={saving}
          onClose={onClose}
          onSave={onSave}
          onDelete={onDelete}
        />
      ) : null}
    </NativeDialog>
  );
}
