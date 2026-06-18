'use client';

import { useMemo } from 'react';
import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';
import { ChartEvolutionTooltip } from '@/components/body-metrics/chart-evolution-tooltip';
import { useMeasurementsEvolutionChart } from '@/hooks/use-measurements-evolution-chart';
import { formatBrlAmount } from '@/utils/wallet';
import {
  niceChartBounds,
  prepareChartDisplayPoints,
  type PlottedChartPoint,
} from '@/utils/measurement-chart';

type MonthlyExpensesSpendingChartProps = {
  points: { label: string; value: number }[];
  loading?: boolean;
  className?: string;
};

const Y_TICK_COUNT: number = 4;

function StaticChartDot({ point }: { point: PlottedChartPoint }) {
  return (
    <span
      className={cn(
        'pointer-events-none absolute h-2.5 w-2.5 rounded-full bg-red',
        point.isFirst && 'left-0 -translate-y-1/2',
        point.isLast && !point.isFirst && 'left-full -translate-x-full -translate-y-1/2',
        !point.isFirst && !point.isLast && '-translate-x-1/2 -translate-y-1/2',
      )}
      style={{
        left: point.isLast && !point.isFirst ? undefined : `${point.xPercent}%`,
        top: `${point.yPercent}%`,
      }}
      aria-hidden
    />
  );
}

function yPercentForValue(value: number, min: number, max: number) {
  const span = max - min || 1;
  return 100 - ((value - min) / span) * 100;
}

export function MonthlyExpensesSpendingChart({
  points,
  loading = false,
  className,
}: MonthlyExpensesSpendingChartProps) {
  const chartPoints = points.map((point) => ({
    id: point.label,
    label: point.label,
    value: point.value,
  }));

  const chart = useMeasurementsEvolutionChart({
    points: chartPoints,
    formatValue: (value) => formatBrlAmount(value),
  });

  const {
    plotted,
    activePoint,
    tooltipPosition,
    linePath,
    singlePointLinePath,
    dateLabelIndices,
    formatPointValue,
    hasRawPoints,
    showStaticDots,
  } = chart.data;

  const { bounds, yTicks } = useMemo(() => {
    const { displayPoints } = prepareChartDisplayPoints(chartPoints);
    const chartBounds = niceChartBounds(displayPoints.map((point) => point.value));
    const span = chartBounds.max - chartBounds.min || 1;
    const ticks = Array.from({ length: Y_TICK_COUNT }, (_, index) => {
      if (Y_TICK_COUNT === 1) return chartBounds.max;
      return chartBounds.max - (span / (Y_TICK_COUNT - 1)) * index;
    });

    return { bounds: chartBounds, yTicks: ticks };
  }, [chartPoints]);

  return (
    <div className={cn('flex min-h-0 flex-1 flex-col', className)}>
      <div className="relative flex min-h-0 w-full flex-1 flex-col pb-1">
        <div className="relative min-h-0 flex-1">
          <div className="absolute inset-x-0 bottom-4 top-0 flex min-h-0">
            {!loading && hasRawPoints ? (
              <div className="relative w-14 shrink-0" aria-hidden>
                {yTicks.map((tick) => (
                  <span
                    key={tick}
                    className={cn(
                      'pointer-events-none absolute right-0 max-w-full -translate-y-1/2 truncate text-right tabular-nums',
                      typeClass.micro,
                      typeToneClass.muted60,
                    )}
                    style={{ top: `${yPercentForValue(tick, bounds.min, bounds.max)}%` }}
                  >
                    {formatBrlAmount(tick)}
                  </span>
                ))}
              </div>
            ) : null}

            <div
              ref={chart.refs.plotAreaRef}
              className="relative min-h-0 min-w-0 flex-1"
              onMouseMove={chart.actions.handleMouseMove}
              onMouseLeave={chart.actions.handleMouseLeave}
            >
              {loading ? (
                <div className={cn('flex h-full items-center justify-center', typeClass.body, typeToneClass.muted60)}>
                  Loading chart…
                </div>
              ) : !hasRawPoints ? (
                <div className={cn('flex h-full items-center justify-center px-4', typeClass.body, typeToneClass.muted60)}>
                  No spending data yet.
                </div>
              ) : (
                <>
                  {yTicks.map((tick) => {
                    const top = yPercentForValue(tick, bounds.min, bounds.max);
                    return (
                      <div
                        key={`grid-${tick}`}
                        className="pointer-events-none absolute inset-x-0 border-t border-grey/30"
                        style={{ top: `${top}%` }}
                        aria-hidden
                      />
                    );
                  })}

                  <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    className="pointer-events-none absolute inset-0 h-full w-full"
                    role="img"
                    aria-label="Spending trend chart"
                  >
                    {plotted.length > 1 ? (
                      <path
                        d={linePath}
                        fill="none"
                        stroke="var(--color-red)"
                        strokeWidth={1.8}
                        vectorEffect="non-scaling-stroke"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                    ) : singlePointLinePath ? (
                      <path
                        d={singlePointLinePath}
                        fill="none"
                        stroke="var(--color-red)"
                        strokeWidth={1.8}
                        vectorEffect="non-scaling-stroke"
                        strokeLinecap="round"
                      />
                    ) : null}
                  </svg>

                  {activePoint ? (
                    <div
                      className="pointer-events-none absolute top-0 bottom-0 w-px bg-red/35"
                      style={{ left: `${activePoint.xPercent}%` }}
                      aria-hidden
                    />
                  ) : null}

                  {showStaticDots ? plotted.map((point) => <StaticChartDot key={point.id} point={point} />) : null}

                  {activePoint ? (
                    <span
                      className="pointer-events-none absolute z-[1] h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red ring-2 ring-red/30"
                      style={{
                        left: `${activePoint.xPercent}%`,
                        top: `${activePoint.yPercent}%`,
                      }}
                      aria-hidden
                    />
                  ) : null}

                  {activePoint && tooltipPosition ? (
                    <ChartEvolutionTooltip
                      data={{
                        point: activePoint,
                        metricLabel: 'Spending',
                        valueLabel: formatPointValue(activePoint.value),
                        left: tooltipPosition.left,
                        top: tooltipPosition.top,
                      }}
                    />
                  ) : null}
                </>
              )}
            </div>
          </div>
        </div>

        {!loading && hasRawPoints ? (
          <div className="mt-1 flex h-4 shrink-0">
            <div className="w-14 shrink-0" aria-hidden />
            <div className="relative min-w-0 flex-1">
              {plotted.map((point, index) =>
                dateLabelIndices.has(index) ? (
                  <span
                    key={`${point.id}-label`}
                    className={cn(
                      'absolute top-0 max-w-[4.5rem] truncate',
                      typeClass.micro,
                      typeToneClass.muted,
                      point.isFirst && 'left-0 text-left',
                      point.isLast && !point.isFirst && 'right-0 text-right',
                      !point.isFirst && !point.isLast && '-translate-x-1/2 text-center',
                    )}
                    style={!point.isFirst && !point.isLast ? { left: `${point.xPercent}%` } : undefined}
                  >
                    {point.label}
                  </span>
                ) : null,
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
