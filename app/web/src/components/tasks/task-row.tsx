'use client';

import { memo } from 'react';
import { TaskOptionsMenu } from '@/components/tasks/task-options-menu';
import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';
import type { TaskVm } from '@/types/task';
import { sourceTypeLabel } from '@/utils/task-mapper';

type TaskRowProps = {
  task: TaskVm;
  index: number;
  disabled?: boolean;
  onEdit: () => void;
  onDelete: () => void;
};

export const TaskRow = memo(function TaskRow({
  task,
  index,
  disabled,
  onEdit,
  onDelete,
}: TaskRowProps) {
  return (
    <div className="flex w-full min-w-0 items-center gap-3 rounded-md bg-layer2-half px-6 py-4 lg:gap-4 lg:px-8 lg:py-5">
      <div className={cn('flex w-16 shrink-0 flex-col items-center justify-center text-center', typeClass.label, 'text-text/70')}>
        <span>{task.rank ?? `${index + 1}º`}</span>
        <span className={cn('mt-0.5', typeClass.micro, typeToneClass.default)}>{task.scheduledAt}</span>
      </div>

      <div className="min-w-0 flex-1">
        <p className={cn('truncate', typeClass.body, typeToneClass.default)}>{task.title}</p>
        <span className={cn('mt-1 inline-flex w-fit rounded-md bg-layer2 px-2 py-0.5', typeClass.overline, 'text-text/60')}>
          {sourceTypeLabel(task.sourceType)}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <TaskOptionsMenu
          taskTitle={task.title}
          onEdit={onEdit}
          onDelete={onDelete}
          disabled={disabled}
        />
      </div>
    </div>
  );
});
