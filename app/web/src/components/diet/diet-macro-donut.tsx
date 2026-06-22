'use client';

import { DistributionDonut } from '@/components/ui/distribution-donut';
import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';
import type { DietMacroSegmentVm } from '@/types/diet';

type DietMacroDonutProps = {
  data: {
    totalKcalLabel: string;
    segments: DietMacroSegmentVm[];
  };
  className?: string;
};

export function DietMacroDonut({ data, className }: DietMacroDonutProps) {
  const kcalValue = data.totalKcalLabel.replace(/\s*Kcal$/i, '').trim();
  const kcalNumber = Number(kcalValue.replace(/,/g, ''));
  const isZero = !Number.isFinite(kcalNumber) || kcalNumber <= 0;

  return (
    <DistributionDonut
      size="fixed"
      segments={data.segments}
      className={className}
      center={
        <>
          <span
            className={cn(
              'leading-none tabular-nums tracking-tight',
              typeClass.stat,
              isZero ? 'text-text/35' : typeToneClass.accent,
            )}
          >
            {kcalValue}
          </span>
          <span
            className={cn(
              'mt-1 uppercase tracking-wider',
              typeClass.overline,
              isZero ? typeToneClass.muted60 : typeToneClass.accent,
            )}
          >
            kcal
          </span>
        </>
      }
    />
  );
}
