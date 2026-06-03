'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';
import { Button } from '@/components/ui/button';
import { IoCheckmark, IoDocumentTextOutline } from 'react-icons/io5';
import { useDailyTasksCardState } from '../../hooks/use-daily-tasks-card-state';

type DailyTask = {
  rank: string;
  title: string;
  done?: boolean;
};

type DailyTasksCardProps = {
  title?: string;
  tasks: DailyTask[];
  style?: React.CSSProperties;
};

function TaskRow({ task, onToggleDone }: { task: DailyTask; onToggleDone: () => void }) {
  return (
    <div className="flex min-h-14 items-stretch overflow-hidden rounded-md bg-layer2-half">
      <div className="flex w-16 shrink-0 items-center justify-center text-xs text-text/70">{task.rank}</div>
      <div className="flex min-w-0 flex-1 items-center px-3 py-4">
        <p className="truncate text-xs text-text/80">{task.title}</p>
      </div>
      <button
        type="button"
        onClick={onToggleDone}
        className={cn(
          'flex w-14 shrink-0 items-center justify-center border-l border-grey/50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red/40',
          task.done ? 'bg-red/70 text-text' : 'bg-layer2 text-text/70 hover:bg-layer2-half',
        )}
        aria-label={task.done ? 'Completed' : 'Mark complete'}
        aria-pressed={!!task.done}
      >
        {task.done ? (
          <IoCheckmark className="h-5 w-5" aria-hidden />
        ) : (
          <IoDocumentTextOutline className="h-5 w-5" aria-hidden />
        )}
      </button>
    </div>
  );
}

export function DailyTasksCard({ title = 'Daily Tasks', tasks, style }: DailyTasksCardProps) {
  const state = useDailyTasksCardState(tasks);

  return (
    <Card className="flex h-full min-h-0 flex-col px-6 py-5 lg:px-7 lg:py-10" style={style}>
      <div className="flex items-start justify-center">
        <h3 className="w-full text-center text-xl font-semibold text-red">{title}</h3>
      </div>

      <div className="mt-10 flex min-h-0 flex-1 flex-col gap-[5px] overflow-y-auto pr-1">
        {state.data.tasks.map((t, idx) => (
          <TaskRow key={`${t.rank}-${idx}-${t.title}`} task={t} onToggleDone={() => state.actions.toggleDone(idx)} />
        ))}
      </div>

      <div className="mt-auto pt-4">
        <Button size="lg" radius="xl">
          Edit Tasks
        </Button>
      </div>
    </Card>
  );
}
