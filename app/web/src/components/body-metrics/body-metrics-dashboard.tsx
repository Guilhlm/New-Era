'use client';

import { BodyMeasurementsHeaderCard } from './body-measurements-header-card';
import { FitnessGoalsCard } from './fitness-goals-card';
import { HealthVitalsCard } from './health-vitals-card';
import { MeasurementsCard } from './measurements-card';
import { useBodyMetricsDashboardState } from '@/hooks/use-body-metrics-dashboard-state';

export function BodyMetricsDashboard() {
  const state = useBodyMetricsDashboardState();

  return (
    <section
      className="flex h-full min-h-0 flex-1 flex-col gap-2.5 lg:grid lg:min-h-0 lg:flex-1 lg:gap-2.5"
      style={{
        gridTemplateColumns: 'minmax(0, 2.65fr) minmax(0, 1fr)',
        gridTemplateRows: 'minmax(180px, auto) minmax(0, 1fr)',
      }}
    >
      <BodyMeasurementsHeaderCard
        data={state.data.header}
        actions={{
          onToggleEdit: state.actions.editMetrics,
          onChangeWeight: state.actions.setHeaderWeightDraft,
          onChangeHeight: state.actions.setHeaderHeightDraft,
        }}
        className="min-h-0"
        style={{ gridColumn: '1 / 2', gridRow: '1 / 2' }}
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
        style={{ gridColumn: '1 / 2', gridRow: '2 / 3' }}
      />

      <div
        className="flex h-full min-h-0 w-full min-w-0 flex-col gap-2.5 overflow-hidden"
        style={{ gridColumn: '2 / 3', gridRow: '1 / 3' }}
      >
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
          className="flex-[2] min-h-0"
        />
        <FitnessGoalsCard
          data={{
            title: state.ui.goalsTitle,
            rows: state.goals.data.rows,
            weightProgress: state.goals.data.weightProgress,
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
          className="flex-1 min-h-0"
        />
      </div>
    </section>
  );
}
