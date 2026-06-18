'use client';

import { useMemo } from 'react';
import { CollapsedItemsPreview } from '@/components/ui/collapsed-items-preview';
import {
  formatMacroGrams,
  formatMacroKcal,
  sumMacroTotals,
} from '@/utils/diet-macros';
import type { DietFoodItemVm } from '@/types/diet';

type DietMealCollapsedIngredientsLineProps = {
  items: DietFoodItemVm[];
};

export function DietMealCollapsedIngredientsLine({ items }: DietMealCollapsedIngredientsLineProps) {
  const totals = useMemo(() => sumMacroTotals(items), [items]);

  if (items.length === 0) {
    return (
      <CollapsedItemsPreview
        count={0}
        countLabel=""
        emptyLabel="No ingredients — tap to expand"
        previewNames={[]}
      />
    );
  }

  return (
    <CollapsedItemsPreview
      count={items.length}
      countLabel={`${items.length} ${items.length === 1 ? 'ing' : 'ings'}`}
      emptyLabel=""
      previewNames={items.map((item) => item.name)}
      metaSegments={[
        `${formatMacroGrams(totals.protein)} protein`,
        `${formatMacroGrams(totals.carbs)} carbs`,
        `${formatMacroGrams(totals.fats)} fat`,
      ]}
    />
  );
}

export function getMealCollapsedKcalLabel(items: DietFoodItemVm[]) {
  return formatMacroKcal(sumMacroTotals(items).calories);
}
