'use client';

import { TrainingCopyDayDialog } from '@/components/training/training-copy-day-dialog';
import { TrainingEditPlanDialog } from '@/components/training/training-edit-plan-dialog';
import { TrainingExerciseEditSheet } from '@/components/training/training-exercise-edit-sheet';
import { TrainingExportSheet } from '@/components/training/training-export-sheet';
import { TrainingGroupsGrid } from '@/components/training/training-groups-grid';
import { TrainingNotesCard } from '@/components/training/training-notes-card';
import { TrainingPlanHeaderCard } from '@/components/training/training-plan-header-card';
import { TrainingPlanSidebarCard } from '@/components/training/training-plan-sidebar-card';
import {
  DashboardSidebarColumn,
  DashboardTwoColumnLayout,
  dashboardGridArea,
} from '@/components/ui/dashboard-two-column-layout';
import { useTrainingDashboardState } from '@/hooks/use-training-dashboard-state';
import { useTrainingExport } from '@/hooks/use-training-export';

export function TrainingDashboard() {
  const state = useTrainingDashboardState();
  const exportState = useTrainingExport({
    weekdayLabel: state.data.header.weekdayLabel,
    planTitle: state.data.header.planTitle,
    groups: state.data.groups,
    isActive: state.data.header.isActive,
    loading: state.ui.loading,
  });

  return (
    <>
      <DashboardTwoColumnLayout>
        <TrainingPlanHeaderCard
          data={state.data.header}
          actions={{
            onExport: () => void exportState.exportTrainingDay(),
            onCopyDay: state.actions.openCopyDay,
          }}
          ui={{
            loading: state.ui.loading,
            saving: state.ui.saving,
            exportDisabled: exportState.exportDisabled,
            exporting: exportState.exporting,
          }}
          className="h-full min-h-0"
          style={dashboardGridArea('main', 'header')}
        />

        <TrainingGroupsGrid
          data={{ groups: state.data.groups }}
          actions={{
            onCreateGroup: state.actions.openCreateGroup,
            onConfirmCreateGroup: state.actions.createGroup,
            onCloseCreateGroup: state.actions.closeCreateGroup,
            onEditGroup: state.actions.editGroup,
            onDeleteGroup: state.actions.removeGroup,
            onToggleGroupExpanded: state.actions.toggleGroupExpanded,
            onStartExerciseDraft: state.actions.startExerciseDraft,
            onChangeDraftField: state.actions.changeDraftField,
            onConfirmDraft: state.actions.confirmDraft,
            onCancelDraft: state.actions.cancelDraft,
            onEditExercise: state.actions.openEditExerciseByIds,
            onReorderExercises: state.actions.reorderExercises,
            onSyncExpandedGroups: state.actions.syncExpandedGroups,
          }}
          ui={{
            loading: state.ui.loading,
            saving: state.ui.saving,
            createGroupOpen: state.ui.createGroupOpen,
          }}
          className="min-h-0 overflow-hidden"
          style={dashboardGridArea('main', 'body')}
        />

        <DashboardSidebarColumn>
          <TrainingPlanSidebarCard
            data={{
              title: 'Workout Plan',
              days: state.data.sidebarDays,
              selectedWeekday: state.ui.selectedWeekday,
            }}
            actions={{
              onSelectDay: state.actions.selectWeekday,
              onSelectRestDay: state.actions.selectRestDay,
              onSelectSheet: state.actions.selectSheet,
              onRemoveSheet: state.actions.removeSheet,
              onEditPlan: state.actions.openEditPlan,
            }}
            ui={{ loading: state.ui.sidebarLoading, saving: state.ui.sidebarSaving }}
            className="min-h-0 flex-[2]"
          />
          <TrainingNotesCard
            data={{ notesDraft: state.data.notesDraft }}
            actions={{
              onNotesChange: state.actions.setNotesDraft,
              onSaveNotes: state.actions.saveNotes,
            }}
            ui={{ saving: state.ui.sidebarSaving }}
            className="min-h-0 flex-1"
          />
        </DashboardSidebarColumn>
      </DashboardTwoColumnLayout>

      <TrainingExportSheet
        ref={exportState.exportRef}
        weekdayLabel={state.data.header.weekdayLabel}
        planTitle={state.data.header.planTitle}
        groups={state.data.groups}
      />

      <TrainingCopyDayDialog
        open={state.ui.copyDayOpen}
        sourceWeekday={state.ui.selectedWeekday}
        sourceWeekdayLabel={state.data.header.weekdayLabel}
        saving={state.ui.saving}
        onClose={state.actions.closeCopyDay}
        onCopy={state.actions.copyDay}
      />

      <TrainingExerciseEditSheet
        open={Boolean(state.data.editExercise)}
        item={state.data.editExercise?.exercise ?? null}
        saving={state.ui.saving}
        onClose={state.actions.closeEditExercise}
        onSave={state.actions.saveEditExercise}
        onDelete={state.actions.deleteEditExercise}
      />

      <TrainingEditPlanDialog
        open={state.ui.editPlanOpen}
        weekdayLabel={state.data.header.weekdayLabel}
        initialTitle={state.data.plan.sheetTitle ?? state.data.plan.title}
        saving={state.ui.sidebarSaving}
        onClose={state.actions.closeEditPlan}
        onSave={state.actions.savePlanTitle}
      />
    </>
  );
}
