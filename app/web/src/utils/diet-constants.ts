import type { DietMealVm, DietWeeklyBarVm } from '@/types/diet';
import { collapseOtherExpanded } from '@/utils/collapse-other-expanded';
import { WEEKDAYS } from '@/utils/weekdays';

export const DIET_WEEKDAYS = WEEKDAYS;

export const MOCK_WEEKLY_CHART: DietWeeklyBarVm[] = [
  { label: 'Seg', heightPercent: 55 },
  { label: 'Ter', heightPercent: 72 },
  { label: 'Qua', heightPercent: 48 },
  { label: 'Qui', heightPercent: 80 },
  { label: 'Sex', heightPercent: 65 },
  { label: 'Sab', heightPercent: 40 },
  { label: 'Dom', heightPercent: 58 },
];

export function collapseOtherMeals(meals: DietMealVm[], activeMealId: string, clearDrafts = true) {
  return collapseOtherExpanded(meals, activeMealId, clearDrafts);
}
