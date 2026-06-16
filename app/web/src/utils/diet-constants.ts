import type { DietMealVm } from '@/types/diet';
import { collapseOtherExpanded } from '@/utils/collapse-other-expanded';
import { WEEKDAYS } from '@/utils/weekdays';

export const DIET_WEEKDAYS = WEEKDAYS;

export function collapseOtherMeals(meals: DietMealVm[], activeMealId: string, clearDrafts = true) {
  return collapseOtherExpanded(meals, activeMealId, clearDrafts);
}
