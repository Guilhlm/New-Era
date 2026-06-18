import type { QueryClient } from '@tanstack/react-query';
import { getCalendarWeekday } from '@/hooks/use-calendar-day-change';
import { queryKeys } from '@/lib/query-keys';
import type { TaskVm } from '@/types/task';

type TasksTodayCache = {
  weekday: number;
  tasks: TaskVm[];
};

/** Keeps task day views, home today card, and discipline charts in sync after mutations. */
export async function invalidateTaskRelatedQueries(
  queryClient: QueryClient,
  weekday: number,
) {
  const invalidations: Array<Promise<void>> = [
    queryClient.invalidateQueries({ queryKey: queryKeys.taskDay(weekday) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.taskWeekdaySummary }),
    queryClient.invalidateQueries({ queryKey: queryKeys.taskSuggestions(weekday) }),
  ];

  if (weekday === getCalendarWeekday()) {
    invalidations.push(
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasksToday,
        refetchType: 'all',
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.disciplineAll,
        refetchType: 'all',
      }),
    );
  }

  await Promise.all(invalidations);
}

/** Mirrors a completion toggle into the create-tasks day cache. */
export function patchTaskDayDone(
  queryClient: QueryClient,
  weekday: number,
  taskId: string,
  done: boolean,
) {
  queryClient.setQueryData<TaskVm[]>(queryKeys.taskDay(weekday), (tasks) => {
    if (tasks) {
      return tasks.map((task) => (task.id === taskId ? { ...task, done } : task));
    }

    const today = queryClient.getQueryData<TasksTodayCache>(queryKeys.tasksToday);
    if (today?.weekday === weekday) {
      return today.tasks.map((task) =>
        task.id === taskId ? { ...task, done } : task,
      );
    }

    return tasks;
  });
}

/** Updates `done` on every cached task-day list that contains the task. */
export function patchTaskDoneEverywhere(
  queryClient: QueryClient,
  taskId: string,
  done: boolean,
) {
  queryClient.setQueriesData<TaskVm[]>(
    { queryKey: ['task-day'] },
    (tasks) => {
      if (!tasks?.some((task) => task.id === taskId)) return tasks;
      return tasks.map((task) => (task.id === taskId ? { ...task, done } : task));
    },
  );
}

/** Diet header macros need today's completion state even when task-day cache is stale. */
export function mergeTasksForDietDay(
  weekday: number,
  dayTasks: TaskVm[] | undefined,
  today: TasksTodayCache | undefined,
): TaskVm[] {
  const base = dayTasks ?? [];
  if (weekday !== getCalendarWeekday() || !today || today.weekday !== weekday) {
    return base;
  }

  if (base.length === 0) return today.tasks;

  const doneById = new Map(today.tasks.map((task) => [task.id, Boolean(task.done)]));
  return base.map((task) => ({
    ...task,
    done: doneById.has(task.id) ? doneById.get(task.id) : task.done,
  }));
}
