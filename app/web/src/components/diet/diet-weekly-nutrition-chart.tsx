'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';

type DietWeeklyBar = {
  label: string;
  heightPercent: number;
};

type DietWeeklyNutritionChartProps = {
  data: {
    title: string;
    bars: DietWeeklyBar[];
    loading?: boolean;
  };
  className?: string;
};

export function DietWeeklyNutritionChart({ data, className }: DietWeeklyNutritionChartProps) {
  const barCount = Math.max(data.bars.length, 1);

  return (
    <Card className={cn('flex h-full min-h-0 flex-col px-6 py-5 lg:px-7 lg:py-4', className)}>
      <p className={cn(typeClass.title, typeToneClass.default)}>{data.title}</p>

      <div className="flex h-full w-full flex-1 flex-col pt-6 pb-4">
        <div className="relative flex h-full w-full min-h-0 flex-col overflow-hidden rounded-2xl bg-layer1/20">
          <div className="relative flex h-full min-h-0 flex-col px-4 py-4">
            {data.loading ? (
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
                      {data.bars.map((bar) => {
                        const clamped = Math.min(100, Math.max(0, Math.round(bar.heightPercent)));
                        const barHeight = clamped <= 0 ? 4 : Math.max(10, clamped);
                        const fill = clamped <= 0 ? 'bg-layer2' : 'bg-red';

                        return (
                          <div key={bar.label} className="flex h-full items-end">
                            <div
                              className={cn('w-full rounded-t-2xl', fill)}
                              style={{ height: `${barHeight}%` }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div
                  className="mt-3 grid gap-4"
                  style={{ gridTemplateColumns: `repeat(${barCount}, minmax(0, 1fr))` }}
                >
                  {data.bars.map((bar) => (
                    <span key={`${bar.label}-label`} className={cn('text-center', typeClass.caption)}>
                      {bar.label}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
