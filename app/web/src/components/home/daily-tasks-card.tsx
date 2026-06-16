'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';
import { IoCheckmark, IoDocumentTextOutline } from 'react-icons/io5';
import { typeClass, typeToneClass } from '@/lib/typography';
import type { DailyTaskHomeVm } from '@/types/task';

type DailyTasksCardProps = {
  title?: string;
  tasks: DailyTaskHomeVm[];
  actions: {
    onToggleDone: (taskId: string) => void;
  };
  ui?: {
    loading?: boolean;
    togglingId?: string | null;
  };
  style?: React.CSSProperties;
};

function TaskRow({
  task,
  disabled,
  onToggleDone,
}: {
  task: DailyTaskHomeVm;
  disabled?: boolean;
  onToggleDone: () => void;
}) {
  return (
    <div className="flex min-h-14 items-stretch overflow-hidden rounded-md bg-layer2-half">
      <div className={cn('flex w-16 shrink-0 items-center justify-center', typeClass.label, 'text-text/70')}>{task.rank}</div>
      <div className="flex min-w-0 flex-1 items-center px-3 py-4">
        <p className={cn('truncate', typeClass.label, 'text-text/80')}>{task.title}</p>
      </div>
      <button
        type="button"
        onClick={onToggleDone}
        disabled={disabled}
        className={cn(
          'flex w-14 shrink-0 items-center justify-center border-l border-grey/50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red/40 disabled:opacity-50',
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

export function DailyTasksCard({ title = 'Daily Tasks', tasks, actions, ui, style }: DailyTasksCardProps) {
  const blocked = ui?.loading;

  return (
    <Card className="flex h-full min-h-0 flex-col px-6 py-5 lg:px-7 lg:py-10" style={style}>
      <div className="flex items-start justify-center">
        <h3 className={cn('w-full text-center', typeClass.stat, typeToneClass.accent)}>{title}</h3>
      </div>

      <div className="mt-10 flex min-h-0 flex-1 flex-col gap-[5px] overflow-y-auto pr-1">
        {blocked ? (
          <div className={cn('rounded-md bg-layer2-half px-4 py-6 text-center', typeClass.body, typeToneClass.muted60)}>Loading tasks…</div>
        ) : tasks.length === 0 ? (
          <div className={cn('rounded-md bg-layer2-half px-4 py-6 text-center', typeClass.body, typeToneClass.muted60)}>
            No tasks for today. Create your schedule in Create Tasks.
          </div>
        ) : (
          tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              disabled={blocked || ui?.togglingId === task.id}
              onToggleDone={() => actions.onToggleDone(task.id)}
            />
          ))
        )}
      </div>

      <div className="mt-auto pt-4">
        <Link
          href="/create-tasks"
          className={cn('inline-flex h-16 w-full max-w-full cursor-pointer items-center justify-center rounded-xl bg-red transition hover:bg-layer2-half hover:text-text', typeClass.bodyStrong, typeToneClass.onAccent)}
        >
          Edit Tasks
        </Link>
      </div>
    </Card>
  );
}
