import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ActivityChartFilters } from '@/components/perfil/activity-chart-filters';
import { cn } from '@/components/ui/cn';
import type { ProfileChartState } from '@/hooks/use-profile-chart';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

type ActivityChartCardProps = {
  chart: ProfileChartState;
};

export function ActivityChartCard({ chart }: ActivityChartCardProps) {
  const visibleHeights = chart.heights.slice(0, 7);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const bars = visibleHeights.map((height, index) => {
    const clamped = Math.min(100, Math.max(0, Math.round(height)));
    const fill = clamped <= 45 ? 'bg-layer2' : 'bg-red';
    const isDimmed = hoveredIndex !== null && hoveredIndex !== index;
    const isActive = hoveredIndex === index;

    return {
      index,
      clamped,
      fill,
      isDimmed,
      isActive,
    };
  });

  return (
    <Card
      className="flex h-full min-h-0 flex-col px-6 py-5 lg:px-7 lg:py-4"
      style={{ gridColumn: '3 / 6', gridRow: '2 / 3' }}
    >
      <ActivityChartFilters
        chartTab={chart.chartTab}
        onChartTabChange={chart.setChartTab}
        period={chart.period}
        onPeriodChange={chart.setPeriod}
      />

      <div className="flex h-full w-full flex-1 flex-col pt-6 pb-4">
        <div className="relative flex h-full w-full flex-col rounded-2xl bg-layer1/20 overflow-hidden">
          
          <div className="relative flex h-full flex-col px-4 py-4">        
            <div className="relative flex-1 min-h-0">
              <div className="absolute inset-x-0 bottom-0 top-[40px]">
                
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(to top, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 30px)',
                    backgroundPosition: 'left bottom',
                  }}
                  aria-hidden
                />

                <div className="relative grid h-full grid-cols-7 items-end gap-4">
                {bars.map((bar) => {
                    return (
                      <div
                        key={`${chart.chartTab}-${chart.period}-${bar.index}`}
                        className="relative flex h-full items-end"
                      >
                        {bar.isActive ? (
                          <div
                            className="pointer-events-none absolute left-1/2 z-20 -translate-x-1/2 rounded-md bg-layer2 px-2 py-1 text-xs text-text shadow-md"
                            style={{ bottom: `calc(${Math.max(10, bar.clamped)}% + 10px)` }}
                          >
                            {bar.clamped}% height
                          </div>
                        ) : null}
                        <div
                          className={cn(
                            'w-full rounded-t-2xl transition-opacity duration-150',
                            bar.fill,
                            bar.isDimmed && 'opacity-35',
                          )}
                          style={{ height: `${Math.max(10, bar.clamped)}%` }}
                          onMouseEnter={() => setHoveredIndex(bar.index)}
                          onMouseLeave={() => setHoveredIndex(null)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-7 gap-4">
              {WEEKDAYS.map((d) => (
                <span key={d} className="text-center text-xs text-text/55">
                  {d}
                </span>
              ))}
            </div>

          </div>
        </div>
      </div>
    </Card>
  );
}