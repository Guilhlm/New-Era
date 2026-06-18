'use client';

import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';
import type { TaskSuggestionVm } from '@/types/task';
import { normalizeTimeInputValue, sourceTypeLabel } from '@/utils/task-mapper';
import { MdOutlineRestaurant } from 'react-icons/md';
import { TbBarbell } from 'react-icons/tb';
import { IoCheckmark } from 'react-icons/io5';

type TaskSuggestionRowProps = {
  item: TaskSuggestionVm;
  toggleDisabled?: boolean;
  onToggle: () => void;
  onTimeChange: (scheduledAt: string) => void;
};

function SuggestionIcon({ sourceType }: { sourceType: TaskSuggestionVm['sourceType'] }) {
  if (sourceType === 'WORKOUT') {
    return <TbBarbell className="h-4 w-4 shrink-0" aria-hidden />;
  }
  if (sourceType === 'DIET_MEAL') {
    return <MdOutlineRestaurant className="h-4 w-4 shrink-0" aria-hidden />;
  }
  return null;
}

export function TaskSuggestionRow({ item, toggleDisabled, onToggle, onTimeChange }: TaskSuggestionRowProps) {
  const selected = Boolean(item.selected);
  const scheduledAt = normalizeTimeInputValue(item.scheduledAt ?? item.defaultScheduledAt);

  return (
    <div
      className={cn(
        'flex min-h-14 items-stretch overflow-hidden rounded-md transition-colors',
        selected ? 'bg-layer2-half ring-1 ring-red/35' : 'bg-layer2-half/70',
      )}
    >
      <button
        type="button"
        disabled={toggleDisabled}
        aria-label={selected ? 'Deselect suggestion' : 'Select suggestion'}
        aria-pressed={selected}
        className={cn(
          'flex w-14 shrink-0 items-center justify-center border-r border-grey/50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red/40 disabled:opacity-50',
          selected ? 'bg-red/70 text-text' : 'bg-layer2 text-text/70 hover:bg-layer2-half',
        )}
        onClick={onToggle}
      >
        {selected ? (
          <IoCheckmark className="h-5 w-5" aria-hidden />
        ) : (
          <SuggestionIcon sourceType={item.sourceType} />
        )}
      </button>

      <div className="flex min-w-0 flex-1 flex-col justify-center px-3 py-3">
        <p className={cn('truncate', typeClass.body, typeToneClass.default)}>{item.title}</p>
        <span className={cn('mt-1 inline-flex w-fit rounded-md bg-layer2 px-2 py-0.5', typeClass.overline, 'text-text/60')}>
          {sourceTypeLabel(item.sourceType)}
        </span>
      </div>

      <div className="flex w-[5.5rem] shrink-0 items-center justify-center border-l border-grey/50 px-2">
        <input
          type="time"
          disabled={!selected}
          value={scheduledAt}
          aria-label={`Time for ${item.title}`}
          className={            cn(
            'w-full rounded-md bg-layer2 px-1.5 py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-red/60 disabled:cursor-not-allowed disabled:opacity-40',
            typeClass.micro,
            typeToneClass.default,
          )}
          onChange={(event) => onTimeChange(event.target.value)}
        />
      </div>
    </div>
  );
}
