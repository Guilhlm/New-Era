'use client';

import { BodyMeasurementsHeaderCard } from './body-measurements-header-card';
import { HealthVitalsCard } from './health-vitals-card';
import { MeasurementsCard } from './measurements-card';
import { WeightGoalCard } from './weight-goal-card';
import { useBodyMetricsDashboardState } from '@/hooks/use-body-metrics-dashboard-state';

export function BodyMetricsDashboard() {
  const state = useBodyMetricsDashboardState();

  return (
    <section
      className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col gap-2.5 lg:grid lg:min-h-0 lg:flex-1 lg:gap-2.5"
      style={{
        // Left side +30% (relative) vs Home's 2:1 layout => ~2.65:1
        gridTemplateColumns: 'minmax(0, 2.65fr) minmax(0, 1fr)',
        // ARCHITECTURE.md: 2ª linha com minmax(0, 1fr) para o grid não estourar a viewport; scroll nos cards.
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
          data={{ title: state.ui.vitalsTitle, rows: state.data.vitals }}
          className="flex-[2] min-h-0"
        />
        <WeightGoalCard
          data={state.data.goal}
          actions={{ onEdit: state.actions.editGoal }}
          className="flex-1 min-h-0"
        />
      </div>
    </section>
  );
}

