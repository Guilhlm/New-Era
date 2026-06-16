'use client';

import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';
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
      className="pointer-events-none absolute z-[2] min-w-[9.5rem] rounded-lg border border-grey/40 bg-layer2/95 px-3 py-2 elevated-shadow backdrop-blur-sm"
      style={{
        left,
        top,
        transform: 'translateX(-50%)',
      }}
    >
      {metricLabel ? (
        <p className={cn(typeClass.overline, 'text-text/50')}>{metricLabel}</p>
      ) : null}
      <p className={cn('mt-0.5', typeClass.bodyStrong, typeToneClass.default)}>{valueLabel}</p>
      <p className={cn('mt-0.5', typeClass.caption, typeToneClass.muted60)}>{getChartTooltipDateLabel(point)}</p>
    </div>
  );
}
