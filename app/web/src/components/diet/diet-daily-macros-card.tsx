'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';
import { DietMacroDonut } from '@/components/diet/diet-macro-donut';
import { DietMacroLegendRow } from '@/components/diet/diet-macro-legend-row';
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
    <Card className={cn('flex h-full min-h-0 flex-col overflow-hidden p-5 lg:p-6', className)}>
      <p className={cn('shrink-0 text-center', typeClass.title, typeToneClass.default)}>{data.title}</p>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center py-3">
        <DietMacroDonut data={{ totalKcalLabel: data.totalKcalLabel, segments: data.segments }} />
      </div>

      <div className="flex w-full shrink-0 flex-col gap-2">
        {data.legend.map((item) => (
          <DietMacroLegendRow key={item.key} item={item} />
        ))}
      </div>
    </Card>
  );
}
