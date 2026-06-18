'use client';

import type { IconType } from 'react-icons';
import { GiChickenLeg, GiDrop, GiWheat } from 'react-icons/gi';
import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';
import type { DietMacroLegendVm } from '@/types/diet';
import { computeProgressPercent, formatMacroGrams } from '@/utils/diet-macros';

const MACRO_ICONS: Record<DietMacroLegendVm['key'], IconType> = {
  protein: GiChickenLeg,
  carbs: GiWheat,
  fats: GiDrop,
};

type DietMacroLegendRowProps = {
  item: DietMacroLegendVm;
};

export function DietMacroLegendRow({ item }: DietMacroLegendRowProps) {
  const Icon = MACRO_ICONS[item.key];
  const percent = computeProgressPercent(item.currentGrams, item.targetGrams);

  return (
    <div className="overflow-hidden rounded-[5px] bg-layer2-half px-3 py-3">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: item.color }}
        >
          <Icon className="h-[1.125rem] w-[1.125rem] text-white" aria-hidden />
        </div>

        <div className="min-w-0 flex-1">
          <p className={cn(typeClass.bodyStrong, typeToneClass.default)}>{item.label}</p>
          <p className={cn('mt-0.5', typeClass.micro, typeToneClass.muted60)}>
            Goal: {formatMacroGrams(item.targetGrams)}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className={cn('tabular-nums leading-none', typeClass.title)} style={{ color: item.color }}>
            {formatMacroGrams(item.currentGrams)}
          </p>
          <p className={cn('mt-1 tabular-nums', typeClass.micro, typeToneClass.muted60)}>{percent}%</p>
        </div>
      </div>
    </div>
  );
}
