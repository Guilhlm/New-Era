'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';

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
    <Card className={cn('flex min-h-0 flex-col gap-4 overflow-hidden p-5 lg:p-6', className)}>
      <p className={cn('shrink-0', typeClass.title, typeToneClass.default)}>Notes</p>

      <div className="flex min-h-0 flex-1 flex-col">
        <textarea
          value={data.notesDraft}
          disabled={ui?.saving}
          placeholder="Add post workout pre-workout notes…"
          className={cn(
            'scrollbar-none min-h-0 flex-[9] resize-none rounded-[5px] bg-layer2-half px-3 py-2 text-text outline-none placeholder:text-text/40 focus-visible:ring-2 focus-visible:ring-red/60',
            typeClass.body,
          )}
          onChange={(event) => actions.onNotesChange(event.target.value)}
        />
        <div className="min-h-0 flex-[1]" aria-hidden />
      </div>

      <Button
        type="button"
        variant="primary"
        size="md"
        disabled={ui?.saving}
        className="h-10 w-full shrink-0"
        onClick={actions.onSaveNotes}
      >
        {ui?.saving ? 'Saving…' : 'Add Notes'}
      </Button>
    </Card>
  );
}
