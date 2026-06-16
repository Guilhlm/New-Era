import type { QueryClient } from '@tanstack/react-query';
import { getCalendarWeekday } from '@/hooks/use-calendar-day-change';
import { queryKeys } from '@/lib/query-keys';
import type { TaskVm } from '@/types/task';

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

    const today = queryClient.getQueryData<{
      weekday: number;
      tasks: TaskVm[];
    }>(queryKeys.tasksToday);
    if (today?.weekday === weekday) {
      return today.tasks.map((task) =>
        task.id === taskId ? { ...task, done } : task,
      );
    }

    return tasks;
  });
}
