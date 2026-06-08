'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/cn';
import { CreateEntityDialog } from '@/components/ui/create-entity-dialog';

type CreateMealFormProps = {
  saving: boolean;
  onCreate: (name: string) => void;
  onClose: () => void;
};

function CreateMealForm({ saving, onCreate, onClose }: CreateMealFormProps) {
  const [name, setName] = useState('');

  return (
    <form
      method="dialog"
      className="flex flex-col gap-4 p-5"
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = name.trim();
        if (trimmed) onCreate(trimmed);
      }}
    >
      <div>
        <p className="text-lg font-semibold text-text">Create meal</p>
        <p className="mt-1 text-sm text-text/60">Give your meal a name for this day.</p>
      </div>

      <input
        type="text"
        autoFocus
        disabled={saving}
        value={name}
        placeholder="Breakfast, Lunch…"
        className="rounded-md bg-layer2 px-3 py-2 text-text outline-none placeholder:text-text/40 focus-visible:ring-2 focus-visible:ring-red/60"
        onChange={(event) => setName(event.target.value)}
      />

      <div className="flex items-center gap-2">
        <Button type="submit" variant="primary" size="sm" disabled={saving || !name.trim()} className="flex-1">
          {saving ? 'Creating…' : 'Create Meal'}
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

type DietCreateMealDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
  saving?: boolean;
};

export function DietCreateMealDialog({ open, onClose, onCreate, saving = false }: DietCreateMealDialogProps) {
  return (
    <CreateEntityDialog open={open} onClose={onClose} formKey="create-meal">
      <CreateMealForm saving={saving} onCreate={onCreate} onClose={onClose} />
    </CreateEntityDialog>
  );
}
