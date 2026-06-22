import type {
  CopyTaskDayInput,
  CreateTaskInput,
  CreateTasksBulkInput,
  TaskDisciplineChartPeriod,
  TaskDisciplineChartTab,
  TaskDisciplineDayVm,
  TaskDisciplineVm,
  TaskSuggestionVm,
  TaskVm,
  UpdateTaskInput,
} from '@/types/task';
import { deleteJson, getJson, patchJson, postJson } from '@/services/http';

export function getTasksDay(weekday: number) {
  return getJson<{ tasks: TaskVm[] }>(`/api/tasks?weekday=${weekday}`, {
    cache: 'no-store',
    credentials: 'include',
  });
}

export function getTasksToday() {
  return getJson<{
    weekday: number;
    tasks: TaskVm[];
    discipline: TaskDisciplineVm;
    dietDiscipline: TaskDisciplineVm;
  }>('/api/tasks/today', {
    cache: 'no-store',
    credentials: 'include',
  });
}

export function getTasksSummary() {
  return getJson<{ days: Array<{ weekday: number; count: number }> }>('/api/tasks/summary', {
    cache: 'no-store',
    credentials: 'include',
  });
}

export function getTaskDisciplineHistory(days: TaskDisciplineChartPeriod = 7, tab: TaskDisciplineChartTab = 'training') {
  return getJson<{ days: TaskDisciplineDayVm[] }>(
    `/api/tasks/discipline/history?days=${days}&tab=${tab}`,
    {
      cache: 'no-store',
      credentials: 'include',
    },
  );
}

export function getTaskSuggestions(weekday: number) {
  return getJson<{ suggestions: TaskSuggestionVm[] }>(`/api/tasks/suggestions?weekday=${weekday}`, {
    cache: 'no-store',
    credentials: 'include',
  });
}

export function createTask(input: CreateTaskInput) {
  return postJson<{ task: TaskVm }, CreateTaskInput>('/api/tasks', input, {
    cache: 'no-store',
    credentials: 'include',
  });
}

export function createTasksBulk(input: CreateTasksBulkInput) {
  return postJson<{ tasks: TaskVm[] }, CreateTasksBulkInput>('/api/tasks/bulk', input, {
    cache: 'no-store',
    credentials: 'include',
  });
}

export function copyTaskDay(input: CopyTaskDayInput) {
  return postJson<{ tasks: TaskVm[] }, CopyTaskDayInput>('/api/tasks/copy-day', input, {
    cache: 'no-store',
    credentials: 'include',
  });
}

export function updateTask(taskId: string, input: UpdateTaskInput) {
  return patchJson<{ task: TaskVm }, UpdateTaskInput>(`/api/tasks/${taskId}`, input, {
    cache: 'no-store',
    credentials: 'include',
  });
}

export function deleteTask(taskId: string) {
  return deleteJson<{ ok: true }>(`/api/tasks/${taskId}`, {
    cache: 'no-store',
    credentials: 'include',
  });
}

export function toggleTaskComplete(taskId: string) {
  return postJson<
    { task: TaskVm; discipline: TaskDisciplineVm; dietDiscipline: TaskDisciplineVm },
    Record<string, never>
  >(
    `/api/tasks/${taskId}/toggle-complete`,
    {},
    {
      cache: 'no-store',
      credentials: 'include',
    },
  );
}
