'use client';

import { useBodyMeasureHeader } from '@/hooks/use-body-measure-header';
import { useBodyMeasureHistory } from '@/hooks/use-body-measure-history';
import { useBodyMeasureQuery } from '@/hooks/use-body-measure-query';
import { useBodyMeasurementsForm } from '@/hooks/use-body-measurements-form';
import { useBodyVitalHistory } from '@/hooks/use-body-vital-history';
import { useFitnessMacroGoal } from '@/hooks/use-fitness-macro-goal';
import { useHealthVitals } from '@/hooks/use-health-vitals';

export function useBodyMetricsDashboardState() {
  const query = useBodyMeasureQuery();
  const headerState = useBodyMeasureHeader(query);
  const measurementsState = useBodyMeasurementsForm(query);
  const historyState = useBodyMeasureHistory(query.measureSyncSignature);
  const vitalsState = useHealthVitals();
  const vitalHistoryState = useBodyVitalHistory(vitalsState.data.syncSignature);
  const goalsState = useFitnessMacroGoal({ currentWeightKg: query.currentWeightKg });

  return {
    data: {
      header: headerState.header,
      currentWeightKg: query.currentWeightKg,
      measurementsUi: measurementsState.measurementsUi,
      chartMeasures: historyState.measures,
      chartVitals: vitalHistoryState.vitals,
      chartMeasureLoading: historyState.loading,
      chartVitalLoading: vitalHistoryState.loading,
      chartMeasureError: historyState.error,
      chartVitalError: vitalHistoryState.error,
    },
    actions: {
      editMetrics: headerState.editMetrics,
      setHeaderWeightDraft: headerState.setHeaderWeightDraft,
      setHeaderHeightDraft: headerState.setHeaderHeightDraft,
      setMeasurementDraft: measurementsState.setMeasurementDraft,
      saveMeasurements: measurementsState.saveMeasurements,
    },
    ui: {
      measurementsTitle: 'Measurements',
      vitalsTitle: 'Health Vitals',
      goalsTitle: 'Goals',
    },
    vitals: vitalsState,
    goals: goalsState,
  };
}

export type BodyMetricsDashboardState = ReturnType<typeof useBodyMetricsDashboardState>;
