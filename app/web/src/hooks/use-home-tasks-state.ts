'use client';

import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { getCalendarWeekday } from '@/hooks/use-calendar-day-change';
import { toastAuthError, toastUpdated } from '@/lib/app-toast';
import { queryKeys } from '@/lib/query-keys';
import { patchTaskDayDone, patchTaskDoneEverywhere } from '@/lib/invalidate-task-caches';
import { getTasksToday, toggleTaskComplete } from '@/services/task';
import { HttpError } from '@/services/http';
import { CRUD_TOAST } from '@/utils/crud-toast-messages';
import type {
  DailyTaskHomeVm,
  TaskDisciplineChartTab,
  TaskDisciplineDayVm,
  TaskDisciplineVm,
  TaskVm,
} from '@/types/task';
import { applyTodayDisciplinePatch } from '@/utils/task-mapper';

const EMPTY_DISCIPLINE: TaskDisciplineVm = {
  percent: 0,
  label: '0%',
  segments: { total: 0, filled: 0 },
};

type TasksTodayData = {
  weekday: number;
  tasks: TaskVm[];
  discipline: TaskDisciplineVm;
  dietDiscipline: TaskDisciplineVm;
};

function buildDiscipline(total: number, filled: number): TaskDisciplineVm {
  const safeFilled = Math.max(0, Math.min(total, filled));
  const percent = total > 0 ? Math.round((safeFilled / total) * 100) : 0;
  return {
    percent,
    label: `${percent}%`,
    segments: { total, filled: safeFilled },
  };
}

function recomputeToday(data: TasksTodayData, taskId: string): TasksTodayData {
  const tasks = data.tasks.map((task) =>
    task.id === taskId ? { ...task, done: !(task.done ?? false) } : task,
  );
  const done = tasks.filter((task) => task.done).length;
  const dietTasks = tasks.filter((task) => task.sourceType === 'DIET_MEAL');
  const dietDone = dietTasks.filter((task) => task.done).length;

  return {
    ...data,
    tasks,
    discipline: buildDiscipline(tasks.length, done),
    dietDiscipline: buildDiscipline(dietTasks.length, dietDone),
  };
}

/**
 * Pushes today's discipline values into every cached discipline chart so the
 * charts react instantly, before the silent refetch settles.
 */
function patchDisciplineCaches(
  queryClient: QueryClient,
  training: TaskDisciplineVm,
  diet: TaskDisciplineVm,
) {
  const patches: Array<[TaskDisciplineChartTab, TaskDisciplineVm]> = [
    ['training', training],
    ['diet', diet],
  ];

  for (const [tab, discipline] of patches) {
    queryClient.setQueriesData<TaskDisciplineDayVm[]>(
      { queryKey: queryKeys.disciplineTab(tab) },
      (days) => {
        if (!days || days.length === 0) return days;
        return applyTodayDisciplinePatch(days, {
          percent: discipline.percent,
          done: discipline.segments.filled,
          total: discipline.segments.total,
        });
      },
    );
  }
}

export function useHomeTasksState() {
  const queryClient = useQueryClient();

  const todayQuery = useQuery({
    queryKey: queryKeys.tasksToday,
    queryFn: getTasksToday,
    retry: 3,
  });

  useEffect(() => {
    if (!todayQuery.isError) return;
    const message =
      todayQuery.error instanceof HttpError
        ? todayQuery.error.message
        : 'Could not load tasks.';
    toastAuthError(message);
  }, [todayQuery.isError, todayQuery.error]);

  const tasks: DailyTaskHomeVm[] = useMemo(() => {
    const raw = todayQuery.data?.tasks ?? [];
    return raw.map((task, index) => ({
      id: task.id,
      rank: task.rank ?? `${index + 1}º`,
      title: task.title,
      done: task.done ?? false,
      sourceType: task.sourceType,
    }));
  }, [todayQuery.data]);

  const discipline = todayQuery.data?.discipline ?? EMPTY_DISCIPLINE;

  const toggleMutation = useMutation({
    mutationFn: (taskId: string) => toggleTaskComplete(taskId),
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasksToday });
      const previous = queryClient.getQueryData<TasksTodayData>(queryKeys.tasksToday);

      if (previous) {
        const optimistic = recomputeToday(previous, taskId);
        queryClient.setQueryData(queryKeys.tasksToday, optimistic);
        patchDisciplineCaches(queryClient, optimistic.discipline, optimistic.dietDiscipline);
        const toggled = optimistic.tasks.find((task) => task.id === taskId);
        if (toggled) {
          const done = Boolean(toggled.done);
          patchTaskDayDone(queryClient, previous.weekday, taskId, done);
          patchTaskDoneEverywhere(queryClient, taskId, done);
        }
      }

      return { previous };
    },
    onError: (error, _taskId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.tasksToday, context.previous);
        patchDisciplineCaches(
          queryClient,
          context.previous.discipline,
          context.previous.dietDiscipline,
        );
      }
      toastAuthError(error instanceof HttpError ? error.message : 'Could not update task.');
    },
    onSuccess: (result) => {
      queryClient.setQueryData<TasksTodayData>(queryKeys.tasksToday, (old) => {
        if (!old) return old;
        return {
          ...old,
          tasks: old.tasks.map((task) =>
            task.id === result.task.id ? { ...task, done: result.task.done } : task,
          ),
          discipline: result.discipline,
          dietDiscipline: result.dietDiscipline,
        };
      });
      patchDisciplineCaches(queryClient, result.discipline, result.dietDiscipline);
      const today = queryClient.getQueryData<TasksTodayData>(queryKeys.tasksToday);
      if (today) {
        const done = Boolean(result.task.done);
        patchTaskDayDone(queryClient, today.weekday, result.task.id, done);
        patchTaskDoneEverywhere(queryClient, result.task.id, done);
      }
      void queryClient.invalidateQueries({ queryKey: queryKeys.taskWeekdaySummary });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.taskDay(today?.weekday ?? getCalendarWeekday()),
      });
      toastUpdated(CRUD_TOAST.taskUpdated);
    },
  });

  return {
    data: {
      tasks,
      discipline: {
        percent: discipline.percent,
        label: discipline.label,
        segments: discipline.segments,
      },
    },
    actions: {
      toggleDone: (taskId: string) => toggleMutation.mutate(taskId),
      reload: () => todayQuery.refetch(),
    },
    ui: {
      loading: todayQuery.isPending,
      togglingId: toggleMutation.isPending ? toggleMutation.variables : null,
    },
  };
}
