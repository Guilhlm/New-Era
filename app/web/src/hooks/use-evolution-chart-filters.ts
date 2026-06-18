'use client';

import { useMemo, useState } from 'react';
import type { LatestBodyMeasure, LatestBodyVital } from '@/services/body-measure';
import {
  EVOLUTION_CHART_OPTIONS,
  type EvolutionChartOption,
} from '@/types/body-metrics';
import { buildEvolutionChartPoints, formatEvolutionTooltipValue } from '@/utils/measurement-chart';

type EvolutionFilterSource = 'measure' | 'vital';

const MEASUREMENT_EVOLUTION_OPTIONS = EVOLUTION_CHART_OPTIONS.filter(
  (option) => option.group === 'Measurements',
);
const VITAL_EVOLUTION_OPTIONS = EVOLUTION_CHART_OPTIONS.filter(
  (option) => option.group === 'Health Vitals',
);

function findEvolutionOption(id: string): EvolutionChartOption | undefined {
  return EVOLUTION_CHART_OPTIONS.find((option) => option.id === id);
}

type UseEvolutionChartFiltersParams = {
  chartMeasures: LatestBodyMeasure[];
  chartVitals: LatestBodyVital[];
  chartMeasureLoading: boolean;
  chartVitalLoading: boolean;
  chartMeasureError: string | null;
  chartVitalError: string | null;
};

export function useEvolutionChartFilters({
  chartMeasures,
  chartVitals,
  chartMeasureLoading,
  chartVitalLoading,
  chartMeasureError,
  chartVitalError,
}: UseEvolutionChartFiltersParams) {
  const [activeSource, setActiveSource] = useState<EvolutionFilterSource>('measure');
  const [measureFilter, setMeasureFilter] = useState(MEASUREMENT_EVOLUTION_OPTIONS[0]!.id);
  const [vitalFilter, setVitalFilter] = useState('');

  const selectedMetric = useMemo(() => {
    const id = activeSource === 'measure' ? measureFilter : vitalFilter;
    return findEvolutionOption(id) ?? MEASUREMENT_EVOLUTION_OPTIONS[0]!;
  }, [activeSource, measureFilter, vitalFilter]);

  const chartPoints = useMemo(
    () => buildEvolutionChartPoints(chartMeasures, chartVitals, selectedMetric),
    [chartMeasures, chartVitals, selectedMetric],
  );

  const chartLoading =
    selectedMetric.source === 'vital' ? chartVitalLoading : chartMeasureLoading;
  const chartError =
    selectedMetric.source === 'vital' ? chartVitalError : chartMeasureError;

  const emptyMessage =
    selectedMetric.source === 'vital'
      ? 'Save vitals to see the evolution.'
      : selectedMetric.field === 'weight'
        ? 'Save weight in the header to see the evolution.'
        : 'Save measurements to see the evolution.';

  const formatValue = useMemo(
    () => (value: number) => formatEvolutionTooltipValue(value, selectedMetric.field),
    [selectedMetric.field],
  );

  function handleMeasureFilterChange(value: string) {
    if (!value) return;
    setMeasureFilter(value);
    setActiveSource('measure');
    setVitalFilter('');
  }

  function handleVitalFilterChange(value: string) {
    if (!value) return;
    setVitalFilter(value);
    setActiveSource('vital');
  }

  return {
    data: {
      chartPoints,
      selectedMetric,
      measureOptions: MEASUREMENT_EVOLUTION_OPTIONS,
      vitalOptions: VITAL_EVOLUTION_OPTIONS,
      measureFilter,
      vitalFilter,
      activeSource,
      chartLoading,
      chartError,
      emptyMessage,
    },
    ui: {
      formatValue,
    },
    actions: {
      handleMeasureFilterChange,
      handleVitalFilterChange,
    },
  };
}
