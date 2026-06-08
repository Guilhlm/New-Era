'use client';

import { MOCK_WEEKLY_CHART } from '@/utils/diet-constants';
import { useDietMacroView } from '@/hooks/use-diet-macro-view';
import { useDietMealsState } from '@/hooks/use-diet-meals-state';

export function useDietDashboardState() {
  const mealsState = useDietMealsState();
  const macroView = useDietMacroView(mealsState.data.meals);

  return {
    data: {
      header: {
        title: 'Diet Plan',
        weekdayLabel: mealsState.data.weekdayLabel,
        weekdayShortLabel: mealsState.data.weekdayShortLabel,
        macroSummaries: macroView.macroSummaries,
      },
      meals: mealsState.data.meals,
      editItem: mealsState.data.editItem,
      dailyMacros: macroView.dailyMacros,
      selectedWeekday: mealsState.data.selectedWeekday,
      weeklyChart: {
        bars: MOCK_WEEKLY_CHART,
      },
    },
    actions: mealsState.actions,
    ui: mealsState.ui,
  };
}

export type DietDashboardState = ReturnType<typeof useDietDashboardState>;
