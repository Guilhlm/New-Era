'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';
import { DietMacroDonut } from '@/components/diet/diet-macro-donut';
import type { DietMacroLegendVm, DietMacroSegmentVm } from '@/types/diet';

type DietDailyMacrosCardProps = {
  data: {
    title: string;
    totalKcalLabel: string;
    segments: DietMacroSegmentVm[];
    legend: DietMacroLegendVm[];
  };
  className?: string;
};

export function DietDailyMacrosCard({ data, className }: DietDailyMacrosCardProps) {
  return (
    <Card
      className={cn(
        'flex h-full min-h-0 flex-col items-center justify-center gap-6 px-5 py-6 lg:px-6',
        className,
      )}
    >
      <p className={cn('w-full shrink-0 text-center', typeClass.title, typeToneClass.default)}>{data.title}</p>

      <DietMacroDonut data={{ totalKcalLabel: data.totalKcalLabel, segments: data.segments }} />

      <div className="w-full shrink-0 space-y-3">
        {data.legend.map((item) => (
          <div key={item.key} className={cn('flex items-center justify-between gap-3', typeClass.body)}>
            <div className="flex min-w-0 items-center gap-3">
              <span
                className={cn('h-4 w-4 shrink-0 rounded-[3px]', item.colorClassName)}
                aria-hidden
              />
              <span className="truncate text-text/70">{item.label}</span>
            </div>
            <span className={cn('shrink-0 tabular-nums', typeClass.bodyStrong)}>
              <span className={item.overTarget ? 'text-red' : 'text-red/90'}>
                {Math.round(item.currentGrams)}
              </span>
              <span className={cn(typeClass.body, 'text-text/75')}> / {Math.round(item.targetGrams)}g</span>
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
