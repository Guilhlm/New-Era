import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ActivityChartFilters } from '@/components/perfil/activity-chart-filters';
import { WalletPerformanceChart } from '@/components/wallet/wallet-performance-chart';
import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';
import type { ProfileFinancialChartState } from '@/hooks/use-profile-financial-chart';
import type { TaskDisciplineChartState } from '@/hooks/use-task-discipline-chart';

type ActivityChartCardProps = {
  chart: TaskDisciplineChartState & {
    financial?: ProfileFinancialChartState;
  };
  className?: string;
  style?: React.CSSProperties;
  filters?: {
    showTab?: boolean;
    leftSlot?: React.ReactNode;
  };
};

export function ActivityChartCard({ chart, className, style, filters }: ActivityChartCardProps) {
  const isFinancial = chart.chartTab === 'financial';
  const barCount = Math.max(chart.heights.length, 1);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const bars = chart.heights.map((height, index) => {
    const clamped = Math.min(100, Math.max(0, Math.round(height)));
    const fill = clamped <= 0 ? 'bg-layer2' : clamped <= 45 ? 'bg-layer2' : 'bg-red';
    const isDimmed = hoveredIndex !== null && hoveredIndex !== index;
    const isActive = hoveredIndex === index;
    const barHeight = clamped <= 0 ? 4 : Math.max(10, clamped);

    return {
      index,
      clamped,
      fill,
      isDimmed,
      isActive,
      barHeight,
      label: chart.labels[index] ?? '',
    };
  });

  return (
    <Card
      className={cn('flex h-full min-h-0 flex-col px-6 py-5 lg:px-7 lg:py-4', className)}
      style={style}
    >
      <ActivityChartFilters
        chartTab={chart.chartTab}
        onChartTabChange={chart.setChartTab}
        period={chart.period}
        onPeriodChange={chart.setPeriod}
        showTab={filters?.showTab}
        leftSlot={filters?.leftSlot}
      />

      <div className="flex h-full w-full flex-1 flex-col pt-6 pb-4">
        <div className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl bg-layer1/20">
          {isFinancial ? (
            <WalletPerformanceChart
              data={{
                points: chart.financial?.points ?? [],
                loading: chart.financial?.loading ?? false,
              }}
              ui={{
                currency: chart.financial?.currency ?? 'USDT',
                alreadyConverted: true,
              }}
              className="h-full min-h-[220px] px-3 py-3"
            />
          ) : (
          <div className="relative flex h-full flex-col px-4 py-4">
            {chart.loading ? (
              <div className={cn('flex flex-1 items-center justify-center', typeClass.body, typeToneClass.muted60)}>Loading chart…</div>
            ) : (
              <>
                <div className="relative min-h-0 flex-1">
                  <div className="absolute inset-x-0 bottom-0 top-[40px]">
                    <div className="chart-grid-bg pointer-events-none absolute inset-0" aria-hidden />

                    <div
                      className="relative grid h-full items-end gap-4"
                      style={{ gridTemplateColumns: `repeat(${barCount}, minmax(0, 1fr))` }}
                    >
                      {bars.map((bar) => (
                        <div key={`${chart.chartTab}-${chart.period}-${bar.index}`} className="relative flex h-full items-end">
                          {bar.isActive ? (
                            <div
                              className={cn('pointer-events-none absolute left-1/2 z-20 -translate-x-1/2 rounded-md bg-layer2 px-2 py-1 shadow-md', typeClass.label, typeToneClass.default)}
                              style={{ bottom: `calc(${bar.barHeight}% + 10px)` }}
                            >
                              {bar.clamped}%
                            </div>
                          ) : null}
                          <div
                            className={cn(
                              'w-full rounded-t-2xl transition-opacity duration-150',
                              bar.fill,
                              bar.isDimmed && 'opacity-35',
                            )}
                            style={{ height: `${bar.barHeight}%` }}
                            onMouseEnter={() => setHoveredIndex(bar.index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div
                  className="mt-3 grid gap-4"
                  style={{ gridTemplateColumns: `repeat(${barCount}, minmax(0, 1fr))` }}
                >
                  {bars.map((bar) => (
                    <span key={`${bar.label}-${bar.index}`} className={cn('text-center', typeClass.caption)}>
                      {bar.label}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
          )}
        </div>
      </div>
    </Card>
  );
}
