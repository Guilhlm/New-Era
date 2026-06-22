'use client';

import { useState } from 'react';
import { useTaskDayQuery } from '@/hooks/use-task-day-query';
import { useTaskMutations } from '@/hooks/use-task-mutations';
import { useTaskSuggestions } from '@/hooks/use-task-suggestions';
import { useTaskWeekdaySummary } from '@/hooks/use-task-weekday-summary';
import { WEEKDAYS } from '@/utils/weekdays';
import { buildTaskDaySummary } from '@/utils/task-day-summary';

export function useTaskDashboardState() {
  const dayQuery = useTaskDayQuery();
  const summaryState = useTaskWeekdaySummary();
  const suggestionsState = useTaskSuggestions(dayQuery.data.selectedWeekday);
  const [saving, setSaving] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [copyDayOpen, setCopyDayOpen] = useState(false);
  const [editPlanOpen, setEditPlanOpen] = useState(false);
  const [editTask, setEditTask] = useState<(typeof dayQuery.data.tasks)[number] | null>(null);

  const mutations = useTaskMutations({
    selectedWeekday: dayQuery.data.selectedWeekday,
    tasks: dayQuery.data.tasks,
    setTasks: dayQuery.actions.setTasks,
    setTasksForDay: dayQuery.actions.setTasksForDay,
    suggestions: suggestionsState.data.suggestions,
    saving,
    setSaving,
    createOpen,
    setCreateOpen,
    editTask,
    setEditTask,
  });

  const summary = buildTaskDaySummary(dayQuery.data.tasks);

  async function savePlanTask(title: string, scheduledAt: string) {
    const saved = await mutations.actions.createManualTask(title, scheduledAt);
    if (saved) setEditPlanOpen(false);
  }

  async function copyDay(targetWeekday: number | 'all') {
    const copied = await mutations.actions.copyDay(targetWeekday);
    if (copied) setCopyDayOpen(false);
  }

  return {
    data: {
      header: {
        title: 'Daily Tasks',
        weekdayLabel: dayQuery.data.weekdayLabel,
        weekdayShortLabel: dayQuery.data.weekdayShortLabel,
        summary,
      },
      tasks: mutations.data.tasks,
      editTask: mutations.data.editTask,
      suggestions: suggestionsState.data.suggestions,
      sidebarDays: WEEKDAYS.map((day) => ({
        weekday: day.index,
        label: day.shortLabel,
        taskCount: summaryState.actions.countForWeekday(day.index),
      })),
      selectedWeekday: dayQuery.data.selectedWeekday,
    },
    actions: {
      prevDay: dayQuery.actions.prevDay,
      nextDay: dayQuery.actions.nextDay,
      selectWeekday: dayQuery.actions.selectWeekday,
      ...mutations.actions,
      ...suggestionsState.actions,
      openCopyDay: () => setCopyDayOpen(true),
      closeCopyDay: () => setCopyDayOpen(false),
      copyDay,
      openEditPlan: () => setEditPlanOpen(true),
      closeEditPlan: () => setEditPlanOpen(false),
      savePlanTask,
    },
    ui: {
      loading: dayQuery.ui.loading || summaryState.ui.loading,
      suggestionsLoading: suggestionsState.ui.loading,
      saving,
      createOpen,
      copyDayOpen,
      editPlanOpen,
    },
  };
}

export type TaskDashboardState = ReturnType<typeof useTaskDashboardState>;
