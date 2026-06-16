'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';
import { MdInfoOutline } from 'react-icons/md';

type TrainingNotesCardProps = {
  data: {
    notesDraft: string;
  };
  actions: {
    onNotesChange: (value: string) => void;
    onSaveNotes: () => void;
  };
  ui?: {
    saving?: boolean;
  };
  className?: string;
};

export function TrainingNotesCard({ data, actions, ui, className }: TrainingNotesCardProps) {
  return (
    <Card className={cn('flex h-full min-h-0 flex-col overflow-hidden p-5 lg:p-6', className)}>
      <div className="flex items-center gap-2">
        <p className={cn(typeClass.title, typeToneClass.default)}>Notes:</p>
        <MdInfoOutline className="h-4 w-4 text-red" aria-hidden />
      </div>

      <textarea
        value={data.notesDraft}
        disabled={ui?.saving}
        placeholder="Add post workout pre-workout notes…"
        className={cn('scrollbar-none mt-4 min-h-0 flex-1 resize-none rounded-lg bg-layer2 px-4 py-3 text-text outline-none placeholder:text-text/40 focus-visible:ring-2 focus-visible:ring-red/60', typeClass.body)}
        onChange={(event) => actions.onNotesChange(event.target.value)}
      />

      <Button
        type="button"
        variant="primary"
        size="md"
        disabled={ui?.saving}
        className="mt-4 h-10 w-full shrink-0"
        onClick={actions.onSaveNotes}
      >
        {ui?.saving ? 'Saving…' : 'Add Notes'}
      </Button>
    </Card>
  );
}
