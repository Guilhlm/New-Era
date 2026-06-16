'use client';

import { TaskSuggestionRow } from '@/components/tasks/task-suggestion-row';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';
import type { TaskSuggestionVm } from '@/types/task';
import { MdLightbulbOutline } from 'react-icons/md';

type TaskSuggestionsCardProps = {
  data: { suggestions: TaskSuggestionVm[] };
  actions: {
    onToggleSuggestion: (sourceId: string) => void;
    onSetSuggestionTime: (sourceId: string, scheduledAt: string) => void;
    onAddSelected: () => void;
  };
  ui?: { loading?: boolean; saving?: boolean };
  className?: string;
};

export function TaskSuggestionsCard({ data, actions, ui, className }: TaskSuggestionsCardProps) {
  const blocked = ui?.loading || ui?.saving;
  const selectedCount = data.suggestions.filter((item) => item.selected).length;

  return (
    <Card className={cn('flex h-full min-h-0 flex-col overflow-hidden p-5 lg:p-6', className)}>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-layer2-half text-red">
          <MdLightbulbOutline className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className={cn(typeClass.title, typeToneClass.default)}>Suggestions</p>
          <p className={cn('mt-0.5', typeClass.body, typeToneClass.muted60)}>From workout and diet for this day.</p>
        </div>
      </div>

      <div className="scrollbar-none mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
        {ui?.loading ? (
          <div className={cn('rounded-md bg-layer2-half px-4 py-6 text-center', typeClass.body, typeToneClass.muted60)}>
            Loading suggestions…
          </div>
        ) : data.suggestions.length === 0 ? (
          <div className="flex h-full min-h-[8rem] flex-col items-center justify-center rounded-md bg-layer2-half px-4 py-6 text-center">
            <p className={cn(typeClass.bodyStrong, 'text-text/80')}>Nothing to suggest yet</p>
            <p className={cn('mt-1 max-w-[14rem] leading-relaxed', typeClass.caption)}>
              Add a workout plan or meals for this weekday to see quick-add reminders here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-[5px]">
            {data.suggestions.map((item) => (
              <TaskSuggestionRow
                key={item.sourceId}
                item={item}
                disabled={blocked}
                onToggle={() => actions.onToggleSuggestion(item.sourceId)}
                onTimeChange={(scheduledAt) => actions.onSetSuggestionTime(item.sourceId, scheduledAt)}
              />
            ))}
          </div>
        )}
      </div>

      <Button
        type="button"
        variant="primary"
        size="md"
        disabled={blocked || selectedCount === 0}
        className="mt-4 h-10 w-full shrink-0"
        onClick={actions.onAddSelected}
      >
        {ui?.saving ? 'Adding…' : selectedCount > 0 ? `Add selected (${selectedCount})` : 'Add selected'}
      </Button>
    </Card>
  );
}
