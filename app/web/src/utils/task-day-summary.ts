import type { TaskDaySummaryVm, TaskVm } from '@/types/task';
import { clampPercent } from '@/utils/number-draft';

export function buildTaskDaySummary(tasks: TaskVm[]): TaskDaySummaryVm {
  const total = tasks.length;
  const done = tasks.filter((task) => task.done).length;
  const completionPercent = total > 0 ? (done / total) * 100 : 0;
  const nextIndex = tasks.findIndex((task) => !task.done);
  const nextTask = nextIndex >= 0 ? tasks[nextIndex] : null;
  const schedulePercent =
    total > 0 ? (nextIndex >= 0 ? clampPercent((nextIndex / total) * 100) : 100) : 0;

  return {
    stats: [
      {
        key: 'tasks',
        label: 'Tasks',
        valueLabel: String(total),
        subLabel: total === 0 ? 'No tasks scheduled' : `${total - done} remaining`,
        percent: clampPercent(completionPercent),
        barClassName: 'bg-red',
      },
      {
        key: 'completed',
        label: 'Completed',
        valueLabel: total > 0 ? `${done}/${total}` : '0',
        subLabel:
          total === 0
            ? 'Add tasks below'
            : done === total
              ? 'All tasks done'
              : `${done} done so far`,
        percent: clampPercent(completionPercent),
        barClassName: 'bg-red/80',
      },
      {
        key: 'next',
        label: 'Next up',
        valueLabel: nextTask?.scheduledAt ?? '—',
        subLabel: nextTask?.title ?? (total === 0 ? 'Nothing queued' : 'All caught up'),
        percent: schedulePercent,
        barClassName: 'bg-red/60',
      },
    ],
  };
}
