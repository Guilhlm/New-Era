'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { MdBarChart, MdViewList } from 'react-icons/md';
import type { LatestBodyMeasure, LatestBodyVital } from '@/services/body-measure';
import type { MeasurementRowVm } from '@/types/body-metrics';
import { MeasurementRow } from '@/components/body-metrics/measurement-row';
import { MeasurementsEvolutionChart } from '@/components/body-metrics/measurements-evolution-chart';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';
import { useEvolutionChartFilters } from '@/hooks/use-evolution-chart-filters';

type MeasurementsView = 'list' | 'chart';

const FILTER_SELECT_CLASS =
  'evolution-filter-select w-full min-w-0 rounded-lg px-3 py-2 text-sm text-text outline-none focus-visible:ring-2 focus-visible:ring-red/60 disabled:cursor-not-allowed disabled:opacity-40';

type MeasurementsCardProps = {
  data: {
    title: string;
    rows: MeasurementRowVm[];
    chartMeasures: LatestBodyMeasure[];
    chartVitals: LatestBodyVital[];
    chartMeasureLoading: boolean;
    chartVitalLoading: boolean;
    chartMeasureError: string | null;
    chartVitalError: string | null;
  };
  ui: {
    loading: boolean;
    saving: boolean;
    hasUnsavedChanges: boolean;
    inputBaseClass: string;
    savedFieldTextClass: string;
  };
  actions: {
    setMeasurementDraft: (field: string, value: string) => void;
    saveMeasurements: () => Promise<void>;
  };
  style?: React.CSSProperties;
  className?: string;
};

export function MeasurementsCard({ data, ui, actions, style, className }: MeasurementsCardProps) {
  const [view, setView] = useState<MeasurementsView>('list');
  const chart = useEvolutionChartFilters({
    chartMeasures: data.chartMeasures,
    chartVitals: data.chartVitals,
    chartMeasureLoading: data.chartMeasureLoading,
    chartVitalLoading: data.chartVitalLoading,
    chartMeasureError: data.chartMeasureError,
    chartVitalError: data.chartVitalError,
  });

  const blocked = ui.loading || ui.saving;
  const saveDisabled = blocked || !ui.hasUnsavedChanges;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (saveDisabled) return;
    void actions.saveMeasurements();
  }

  return (
    <Card
      as="form"
      onSubmit={onSubmit}
      className={cn(
        'flex h-full min-h-0 flex-col overflow-hidden px-6 py-5 lg:px-8 lg:py-10',
        className,
      )}
      style={style}
    >
      <div className="ml-2.5 mt-0 mb-[22px] flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-lg font-semibold text-[color:var(--color-text-60)]">
          {view === 'chart' ? 'Evolution' : data.title}
        </p>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Ver gráfico de evolução"
            aria-pressed={view === 'chart'}
            className={cn(
              'h-10 w-10 shrink-0 p-0',
              view === 'chart'
                ? 'bg-red text-text hover:opacity-90'
                : 'bg-layer2 text-text hover:bg-red/15 hover:text-red',
            )}
            onClick={() => setView('chart')}
          >
            <MdBarChart className="h-5 w-5 shrink-0" aria-hidden />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Ver lista de medidas"
            aria-pressed={view === 'list'}
            className={cn(
              'h-10 w-10 shrink-0 p-0',
              view === 'list'
                ? 'bg-red text-text hover:opacity-90'
                : 'bg-layer2 text-text hover:bg-red/15 hover:text-red',
            )}
            onClick={() => setView('list')}
          >
            <MdViewList className="h-5 w-5 shrink-0" aria-hidden />
          </Button>

          {view === 'list' ? (
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={saveDisabled}
              className="h-auto shrink-0 px-8 py-3 font-medium disabled:opacity-40 sm:px-14"
            >
              {ui.saving ? 'Saving…' : 'Save Metrics'}
            </Button>
          ) : null}
        </div>
      </div>

      {view === 'chart' ? (
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="ml-2.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex min-w-0 flex-col gap-1.5">
              <label
                htmlFor="evolution-measure-filter"
                className="text-xs font-medium uppercase tracking-wide text-text/55"
              >
                Measurements
              </label>
              <select
                id="evolution-measure-filter"
                value={chart.data.activeSource === 'measure' ? chart.data.measureFilter : ''}
                onChange={(event) => chart.actions.handleMeasureFilterChange(event.target.value)}
                className={cn(
                  FILTER_SELECT_CLASS,
                  chart.data.activeSource === 'vital' && 'opacity-40',
                )}
              >
                {chart.data.activeSource === 'vital' ? <option value="">—</option> : null}
                {chart.data.measureOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex min-w-0 flex-col gap-1.5">
              <label
                htmlFor="evolution-vital-filter"
                className="text-xs font-medium uppercase tracking-wide text-text/55"
              >
                Health Vitals
              </label>
              <select
                id="evolution-vital-filter"
                value={chart.data.activeSource === 'vital' ? chart.data.vitalFilter : ''}
                onChange={(event) => chart.actions.handleVitalFilterChange(event.target.value)}
                className={cn(
                  FILTER_SELECT_CLASS,
                  chart.data.activeSource === 'measure' && 'opacity-40',
                )}
              >
                {chart.data.activeSource === 'measure' ? (
                  <option value="">—</option>
                ) : (
                  <option value="" disabled hidden>
                    Select
                  </option>
                )}
                {chart.data.vitalOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {chart.data.chartError ? (
            <p className="px-2 text-sm text-red" role="alert">
              {chart.data.chartError}
            </p>
          ) : null}

          <MeasurementsEvolutionChart
            data={{
              points: chart.data.chartPoints,
              metricLabel: chart.data.selectedMetric.label,
              formatValue: chart.ui.formatValue,
              loading: chart.data.chartLoading,
              emptyMessage: chart.data.emptyMessage,
            }}
            className="min-h-0 w-full flex-1"
          />
        </div>
      ) : (
        <div className="scrollbar-none mt-0 min-h-0 flex-1 overflow-auto">
          <div className="relative pl-7 lg:pl-9 pr-1">
            <div
              className="absolute bottom-0 left-[0.6875rem] top-0 w-px bg-layer2 lg:left-[1.125rem]"
              aria-hidden
            />

            <div className="divide-y divide-layer2">
              {data.rows.map((row) => (
                <MeasurementRow
                  key={row.key}
                  row={row}
                  disabled={blocked}
                  inputBaseClass={ui.inputBaseClass}
                  savedFieldTextClass={ui.savedFieldTextClass}
                  onChange={actions.setMeasurementDraft}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
