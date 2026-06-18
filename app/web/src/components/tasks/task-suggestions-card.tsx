'use client';

import { TaskSuggestionRow } from '@/components/tasks/task-suggestion-row';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';
import type { TaskSuggestionVm } from '@/types/task';

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
  const listBlocked = ui?.loading;
  const addBlocked = ui?.loading || ui?.saving;
  const selectedCount = data.suggestions.filter((item) => item.selected).length;

  return (
    <Card className={cn('flex min-h-0 flex-col gap-4 overflow-hidden p-5 lg:p-6', className)}>
      <p className={cn('shrink-0', typeClass.title, typeToneClass.default)}>Suggestions</p>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-[9] overflow-hidden">
          {ui?.loading ? (
            <div
              className={cn(
                'h-full rounded-[5px] bg-layer2-half px-3 py-2 text-text/40',
                typeClass.body,
              )}
            >
              Loading suggestions…
            </div>
          ) : data.suggestions.length === 0 ? (
            <div
              className={cn(
                'h-full rounded-[5px] bg-layer2-half px-3 py-2 text-text/40',
                typeClass.body,
              )}
            >
              Add workout or diet items for this day to see suggestions here…
            </div>
          ) : (
            <div className="flex h-full min-h-0 flex-col gap-[5px] overflow-y-auto pr-1">
              {data.suggestions.map((item) => (
                <TaskSuggestionRow
                  key={item.sourceId}
                  item={item}
                  toggleDisabled={listBlocked}
                  onToggle={() => actions.onToggleSuggestion(item.sourceId)}
                  onTimeChange={(scheduledAt) => actions.onSetSuggestionTime(item.sourceId, scheduledAt)}
                />
              ))}
            </div>
          )}
        </div>
        <div className="min-h-0 flex-[1]" aria-hidden />
      </div>

      <Button
        type="button"
        variant="primary"
        size="md"
        disabled={addBlocked || selectedCount === 0}
        className="h-10 w-full shrink-0"
        onClick={actions.onAddSelected}
      >
        {ui?.saving ? 'Adding…' : selectedCount > 0 ? `Add selected (${selectedCount})` : 'Add selected'}
      </Button>
    </Card>
  );
}
