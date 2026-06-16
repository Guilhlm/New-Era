'use client';

import { TaskAddTaskSlot } from '@/components/tasks/task-add-task-slot';
import { TaskCreateDialog } from '@/components/tasks/task-create-dialog';
import { TaskRow } from '@/components/tasks/task-row';
import { EntityEmptyState } from '@/components/ui/entity-empty-state';
import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';
import type { TaskVm } from '@/types/task';
import { MdOutlineTaskAlt } from 'react-icons/md';

type TaskScheduleListProps = {
  data: { tasks: TaskVm[] };
  actions: {
    onCreateTask: () => void;
    onConfirmCreateTask: (title: string, scheduledAt: string) => void;
    onCloseCreateTask: () => void;
    onEditTask: (task: TaskVm) => void;
    onDeleteTask: (taskId: string) => void;
  };
  ui?: {
    loading?: boolean;
    saving?: boolean;
    createOpen?: boolean;
  };
  className?: string;
  style?: React.CSSProperties;
};

export function TaskScheduleList({
  data,
  actions,
  ui,
  className,
  style,
}: TaskScheduleListProps) {
  const blocked = ui?.loading || ui?.saving;

  if (ui?.loading) {
    return (
      <div className={cn('flex h-full min-h-0 items-center px-6', className)} style={style}>
        <p className={cn(typeClass.body, typeToneClass.muted60)}>Loading tasks…</p>
      </div>
    );
  }

  return (
    <>
      <TaskCreateDialog
        open={Boolean(ui?.createOpen)}
        saving={Boolean(ui?.saving)}
        onClose={actions.onCloseCreateTask}
        onCreate={actions.onConfirmCreateTask}
      />

      {data.tasks.length === 0 ? (
        <EntityEmptyState
          title="No tasks yet"
          description="Create a manual task or add suggestions from workout and diet."
          actionLabel="Create task"
          onAction={actions.onCreateTask}
          icon={<MdOutlineTaskAlt className="h-7 w-7" aria-hidden />}
          className={className}
          style={style}
        />
      ) : (
        <div
          className={cn(
            'relative flex h-full min-h-0 flex-col gap-2.5 overflow-y-auto [scrollbar-gutter:stable]',
            className,
          )}
          style={style}
        >
          <div className="flex shrink-0 flex-col gap-[5px]">
            {data.tasks.map((task, index) => (
              <TaskRow
                key={task.id}
                task={task}
                index={index}
                disabled={blocked}
                onEdit={() => actions.onEditTask(task)}
                onDelete={() => actions.onDeleteTask(task.id)}
              />
            ))}
          </div>

          <div className="min-h-[72px] flex-1">
            <TaskAddTaskSlot onAddTask={actions.onCreateTask} className="h-full min-h-[72px]" />
          </div>
        </div>
      )}
    </>
  );
}
