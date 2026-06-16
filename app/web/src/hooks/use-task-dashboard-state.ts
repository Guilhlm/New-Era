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
  const [editTask, setEditTask] = useState<(typeof dayQuery.data.tasks)[number] | null>(null);

  const mutations = useTaskMutations({
    selectedWeekday: dayQuery.data.selectedWeekday,
    tasks: dayQuery.data.tasks,
    setTasks: dayQuery.actions.setTasks,
    suggestions: suggestionsState.data.suggestions,
    saving,
    setSaving,
    createOpen,
    setCreateOpen,
    editTask,
    setEditTask,
  });

  const summary = buildTaskDaySummary(dayQuery.data.tasks);

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
    },
    ui: {
      loading: dayQuery.ui.loading || summaryState.ui.loading,
      suggestionsLoading: suggestionsState.ui.loading,
      saving,
      createOpen,
    },
  };
}

export type TaskDashboardState = ReturnType<typeof useTaskDashboardState>;
