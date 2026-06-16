'use client';

import { HomeDashboard } from '@/components/home/home-dashboard';
import { useHomeTasksState } from '@/hooks/use-home-tasks-state';
import { useTaskDisciplineChart } from '@/hooks/use-task-discipline-chart';

export function HomeTasksContainer() {
  const chart = useTaskDisciplineChart({ tab: 'training' });
  const state = useHomeTasksState();

  return (
    <HomeDashboard
      discipline={state.data.discipline}
      tasks={state.data.tasks}
      chart={chart}
      actions={{
        onToggleDone: state.actions.toggleDone,
      }}
      ui={{
        loading: state.ui.loading,
        togglingId: state.ui.togglingId,
      }}
    />
  );
}
