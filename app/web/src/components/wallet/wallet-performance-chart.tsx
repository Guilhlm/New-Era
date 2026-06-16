'use client';

import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';
import { ChartEvolutionTooltip } from '@/components/body-metrics/chart-evolution-tooltip';
import { useMeasurementsEvolutionChart } from '@/hooks/use-measurements-evolution-chart';
import type { WalletCurrency } from '@/types/wallet';
import { formatWalletAmount } from '@/utils/wallet';
import type { PlottedChartPoint } from '@/utils/measurement-chart';

type WalletPerformanceChartProps = {
  data: {
    points: { label: string; value: number }[];
    loading?: boolean;
  };
  ui?: {
    currency?: WalletCurrency;
    alreadyConverted?: boolean;
  };
  className?: string;
};

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

export function WalletPerformanceChart({ data, className, ui }: WalletPerformanceChartProps) {
  const chartPoints = data.points.map((point) => ({
    id: point.label,
    label: point.label,
    value: point.value,
  }));

  const chart = useMeasurementsEvolutionChart({
    points: chartPoints,
    formatValue: (value) =>
      formatWalletAmount(value, {
        currency: ui?.currency,
        alreadyConverted: ui?.alreadyConverted,
      }),
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

  return (
    <div className={cn('flex h-full min-h-0 w-full flex-1 flex-col', className)}>
      <div className="relative flex h-full min-h-[200px] w-full flex-col px-1 pb-1">
        <div className="relative min-h-0 flex-1">
          <div
            ref={chart.refs.plotAreaRef}
            className="absolute inset-x-0 bottom-4 top-0"
            onMouseMove={chart.actions.handleMouseMove}
            onMouseLeave={chart.actions.handleMouseLeave}
          >
            {data.loading ? (
              <div className={cn('flex h-full items-center justify-center', typeClass.body, typeToneClass.muted60)}>Loading chart…</div>
            ) : !hasRawPoints ? (
              <div className={cn('flex h-full items-center justify-center px-4', typeClass.body, typeToneClass.muted60)}>
                No performance data yet.
              </div>
            ) : (
              <>
                <div className="chart-grid-bg pointer-events-none absolute inset-0 rounded-xl" aria-hidden />

                <svg
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  className="pointer-events-none absolute inset-0 h-full w-full"
                  role="img"
                  aria-label="Portfolio performance chart"
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
                      metricLabel: 'Portfolio value',
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

        {!data.loading && hasRawPoints ? (
          <div className="relative mt-1 h-4 w-full">
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
        ) : null}
      </div>
    </div>
  );
}
