'use client';

import { useQueryClient } from '@tanstack/react-query';
import { toastAuthError, toastUpdated } from '@/lib/app-toast';
import { invalidateTaskRelatedQueries } from '@/lib/invalidate-task-caches';
import {
  createTask,
  createTasksBulk,
  deleteTask,
  updateTask,
} from '@/services/task';
import { HttpError } from '@/services/http';
import type { TaskSuggestionVm, TaskVm } from '@/types/task';
import { CRUD_TOAST } from '@/utils/crud-toast-messages';

type UseTaskMutationsParams = {
  selectedWeekday: number;
  tasks: TaskVm[];
  setTasks: (tasks: TaskVm[] | ((prev: TaskVm[]) => TaskVm[])) => void;
  suggestions: TaskSuggestionVm[];
  saving: boolean;
  setSaving: (value: boolean) => void;
  createOpen: boolean;
  setCreateOpen: (value: boolean) => void;
  editTask: TaskVm | null;
  setEditTask: (task: TaskVm | null) => void;
};

export function useTaskMutations({
  selectedWeekday,
  tasks,
  setTasks,
  suggestions,
  saving,
  setSaving,
  createOpen,
  setCreateOpen,
  editTask,
  setEditTask,
}: UseTaskMutationsParams) {
  const queryClient = useQueryClient();

  async function invalidateTaskCaches(weekday: number) {
    await invalidateTaskRelatedQueries(queryClient, weekday);
  }

  function openCreate() {
    setCreateOpen(true);
  }

  function closeCreate() {
    setCreateOpen(false);
  }

  function openEdit(task: TaskVm) {
    setEditTask(task);
  }

  function closeEdit() {
    setEditTask(null);
  }

  async function createManualTask(title: string, scheduledAt: string) {
    setSaving(true);
    try {
      await createTask({ weekday: selectedWeekday, title, scheduledAt });
      setCreateOpen(false);
      await invalidateTaskCaches(selectedWeekday);
      toastUpdated(CRUD_TOAST.taskCreated);
    } catch (error) {
      toastAuthError(error instanceof HttpError ? error.message : 'Could not create task.');
    } finally {
      setSaving(false);
    }
  }

  async function saveEditTask(title: string, scheduledAt: string) {
    if (!editTask) return;
    setSaving(true);
    try {
      await updateTask(editTask.id, { title, scheduledAt });
      setEditTask(null);
      await invalidateTaskCaches(selectedWeekday);
      toastUpdated(CRUD_TOAST.taskUpdated);
    } catch (error) {
      toastAuthError(error instanceof HttpError ? error.message : 'Could not update task.');
    } finally {
      setSaving(false);
    }
  }

  async function removeTask(taskId: string) {
    setSaving(true);
    try {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      if (editTask?.id === taskId) setEditTask(null);
      await invalidateTaskCaches(selectedWeekday);
      toastUpdated(CRUD_TOAST.taskDeleted);
    } catch (error) {
      toastAuthError(error instanceof HttpError ? error.message : 'Could not delete task.');
    } finally {
      setSaving(false);
    }
  }

  async function addSelectedSuggestions() {
    const selected = suggestions.filter((item) => item.selected);
    if (selected.length === 0) return;

    setSaving(true);
    try {
      await createTasksBulk({
        weekday: selectedWeekday,
        tasks: selected.map((item) => ({
          title: item.title,
          scheduledAt: item.scheduledAt ?? item.defaultScheduledAt,
          sourceType: item.sourceType,
          sourceId: item.sourceId,
        })),
      });
      await invalidateTaskCaches(selectedWeekday);
      toastUpdated(CRUD_TOAST.tasksAdded);
    } catch (error) {
      toastAuthError(error instanceof HttpError ? error.message : 'Could not add suggestions.');
    } finally {
      setSaving(false);
    }
  }

  return {
    data: {
      tasks,
      editTask,
    },
    actions: {
      openCreate,
      closeCreate,
      openEdit,
      closeEdit,
      createManualTask,
      saveEditTask,
      removeTask,
      addSelectedSuggestions,
    },
    ui: {
      saving,
      createOpen,
    },
  };
}
