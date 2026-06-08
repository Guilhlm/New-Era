'use client';

import { getChartTooltipDateLabel } from '@/utils/measurement-chart';
import type { PlottedChartPoint } from '@/utils/measurement-chart';

type ChartEvolutionTooltipProps = {
  data: {
    point: PlottedChartPoint;
    metricLabel?: string;
    valueLabel: string;
    left: number;
    top: number;
  };
};

export function ChartEvolutionTooltip({ data }: ChartEvolutionTooltipProps) {
  const { point, metricLabel, valueLabel, left, top } = data;

  return (
    <div
      className="pointer-events-none absolute z-[2] min-w-[9.5rem] rounded-lg border border-grey/40 bg-layer2/95 px-3 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.45)] backdrop-blur-sm"
      style={{
        left,
        top,
        transform: 'translateX(-50%)',
      }}
    >
      {metricLabel ? (
        <p className="text-[0.65rem] font-medium uppercase tracking-wide text-text/50">{metricLabel}</p>
      ) : null}
      <p className="mt-0.5 text-sm font-semibold text-text">{valueLabel}</p>
      <p className="mt-0.5 text-xs text-text/60">{getChartTooltipDateLabel(point)}</p>
    </div>
  );
}
