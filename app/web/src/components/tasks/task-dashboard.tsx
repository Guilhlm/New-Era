'use client';

import { TaskEditPlanDialog } from '@/components/tasks/task-edit-plan-dialog';
import { TaskEditSheet } from '@/components/tasks/task-edit-sheet';
import { TaskPlanHeaderCard } from '@/components/tasks/task-plan-header-card';
import { TaskScheduleList } from '@/components/tasks/task-schedule-list';
import { TaskSuggestionsCard } from '@/components/tasks/task-suggestions-card';
import { TaskWeekdaySidebarCard } from '@/components/tasks/task-weekday-sidebar-card';
import {
  DashboardSidebarColumn,
  DashboardTwoColumnLayout,
  dashboardGridArea,
} from '@/components/ui/dashboard-two-column-layout';
import { useTaskDashboardState } from '@/hooks/use-task-dashboard-state';

export function TaskDashboard() {
  const state = useTaskDashboardState();

  return (
    <>
      <DashboardTwoColumnLayout>
        <TaskPlanHeaderCard
          data={state.data.header}
          actions={{
            onPrevDay: state.actions.prevDay,
            onNextDay: state.actions.nextDay,
          }}
          ui={{ loading: state.ui.loading }}
          className="h-full min-h-0"
          style={dashboardGridArea('main', 'header')}
        />

        <TaskScheduleList
          data={{ tasks: state.data.tasks }}
          actions={{
            onCreateTask: state.actions.openCreate,
            onConfirmCreateTask: state.actions.createManualTask,
            onCloseCreateTask: state.actions.closeCreate,
            onEditTask: state.actions.openEdit,
            onDeleteTask: state.actions.removeTask,
          }}
          ui={{
            loading: state.ui.loading,
            saving: state.ui.saving,
            createOpen: state.ui.createOpen,
          }}
          className="min-h-0 overflow-hidden"
          style={dashboardGridArea('main', 'body')}
        />

        <DashboardSidebarColumn>
          <TaskWeekdaySidebarCard
            data={{
              title: 'Weekdays',
              days: state.data.sidebarDays,
              selectedWeekday: state.data.selectedWeekday,
            }}
            actions={{
              onSelectDay: state.actions.selectWeekday,
              onEditPlan: state.actions.openEditPlan,
            }}
            ui={{ loading: state.ui.loading, saving: state.ui.saving }}
            className="min-h-0 flex-[2]"
          />
          <TaskSuggestionsCard
            data={{ suggestions: state.data.suggestions }}
            actions={{
              onToggleSuggestion: state.actions.toggleSuggestion,
              onSetSuggestionTime: state.actions.setSuggestionTime,
              onAddSelected: state.actions.addSelectedSuggestions,
            }}
            ui={{ loading: state.ui.suggestionsLoading, saving: state.ui.saving }}
            className="min-h-0 flex-1"
          />
        </DashboardSidebarColumn>
      </DashboardTwoColumnLayout>

      <TaskEditPlanDialog
        open={state.ui.editPlanOpen}
        weekdayLabel={state.data.header.weekdayLabel}
        saving={state.ui.saving}
        onClose={state.actions.closeEditPlan}
        onSave={state.actions.savePlanTask}
      />

      <TaskEditSheet
        open={Boolean(state.data.editTask)}
        task={state.data.editTask}
        saving={state.ui.saving}
        onClose={state.actions.closeEdit}
        onSave={state.actions.saveEditTask}
        onDelete={() => {
          if (state.data.editTask) void state.actions.removeTask(state.data.editTask.id);
        }}
      />
    </>
  );
}
