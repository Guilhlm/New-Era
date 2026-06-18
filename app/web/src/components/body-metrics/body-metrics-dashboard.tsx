'use client';

import { BodyMeasurementsHeaderCard } from './body-measurements-header-card';
import { FitnessGoalsCard } from './fitness-goals-card';
import { HealthVitalsCard } from './health-vitals-card';
import { MeasurementsCard } from './measurements-card';
import {
  DashboardSidebarColumn,
  DashboardTwoColumnLayout,
  dashboardGridArea,
} from '@/components/ui/dashboard-two-column-layout';
import { useBodyMetricsDashboardState } from '@/hooks/use-body-metrics-dashboard-state';

export function BodyMetricsDashboard() {
  const state = useBodyMetricsDashboardState();

  return (
    <DashboardTwoColumnLayout>
      <BodyMeasurementsHeaderCard
        data={state.data.header}
        actions={{
          onToggleEdit: state.actions.editMetrics,
          onChangeWeight: state.actions.setHeaderWeightDraft,
          onChangeHeight: state.actions.setHeaderHeightDraft,
        }}
        className="h-full min-h-0"
        style={dashboardGridArea('main', 'header')}
      />

      <MeasurementsCard
        data={{
          title: state.ui.measurementsTitle,
          rows: state.data.measurementsUi.rows,
          chartMeasures: state.data.chartMeasures,
          chartVitals: state.data.chartVitals,
          chartMeasureLoading: state.data.chartMeasureLoading,
          chartVitalLoading: state.data.chartVitalLoading,
          chartMeasureError: state.data.chartMeasureError,
          chartVitalError: state.data.chartVitalError,
        }}
        ui={{
          loading: state.data.measurementsUi.loading,
          saving: state.data.measurementsUi.saving,
          hasUnsavedChanges: state.data.measurementsUi.hasUnsavedChanges,
          inputBaseClass: state.data.measurementsUi.inputBaseClass,
          savedFieldTextClass: state.data.measurementsUi.savedFieldTextClass,
        }}
        actions={{
          setMeasurementDraft: state.actions.setMeasurementDraft,
          saveMeasurements: state.actions.saveMeasurements,
        }}
        className="min-h-0 overflow-hidden"
        style={dashboardGridArea('main', 'body')}
      />

      <DashboardSidebarColumn className="grid grid-rows-[minmax(0,10fr)_minmax(0,4fr)]">
        <HealthVitalsCard
          data={{
            title: state.ui.vitalsTitle,
            rows: state.vitals.data.rows,
            editing: state.vitals.data.editing,
            loading: state.vitals.data.loading,
            saving: state.vitals.data.saving,
            hasDirty: state.vitals.data.hasDirty,
          }}
          actions={{
            onToggleEdit: () => void state.vitals.actions.toggleEdit(),
            onChange: state.vitals.actions.setVitalDraft,
          }}
          className="min-h-0"
        />
        <FitnessGoalsCard
          data={{
            title: state.ui.goalsTitle,
            rows: state.goals.data.rows,
            editing: state.goals.data.editing,
            loading: state.goals.data.loading,
            saving: state.goals.data.saving,
            dirty: state.goals.data.dirty,
          }}
          actions={{
            onToggleEdit: () => void state.goals.actions.toggleEdit(),
            onWeightGoalChange: state.goals.actions.setWeightGoalDraft,
            onCaloriesChange: state.goals.actions.setCaloriesDraft,
          }}
          className="min-h-0"
        />
      </DashboardSidebarColumn>
    </DashboardTwoColumnLayout>
  );
}
