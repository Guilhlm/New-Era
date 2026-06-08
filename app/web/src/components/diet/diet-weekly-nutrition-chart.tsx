'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';
import type { DietWeeklyBarVm } from '@/types/diet';

type DietWeeklyNutritionChartProps = {
  data: {
    title: string;
    bars: DietWeeklyBarVm[];
  };
  className?: string;
};

export function DietWeeklyNutritionChart({ data, className }: DietWeeklyNutritionChartProps) {
  return (
    <Card className={cn('flex h-full min-h-0 flex-col px-6 py-5 lg:px-7 lg:py-4', className)}>
      <p className="text-lg font-semibold text-text">{data.title}</p>

      <div className="flex h-full w-full flex-1 flex-col pt-6 pb-4">
        <div className="relative flex h-full w-full min-h-0 flex-col overflow-hidden rounded-2xl bg-layer1/20">
          <div className="relative flex h-full min-h-0 flex-col px-4 py-4">
            <div className="relative min-h-0 flex-1">
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
                  {data.bars.map((bar) => {
                    const clamped = Math.min(100, Math.max(10, Math.round(bar.heightPercent)));
                    return (
                      <div key={bar.label} className="flex h-full items-end">
                        <div
                          className="w-full rounded-t-2xl bg-red"
                          style={{ height: `${clamped}%` }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-7 gap-4">
              {data.bars.map((bar) => (
                <span key={`${bar.label}-label`} className="text-center text-xs text-text/55">
                  {bar.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
