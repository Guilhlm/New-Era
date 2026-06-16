'use client';

import { useDietMacroView } from '@/hooks/use-diet-macro-view';
import { useDietMealsState } from '@/hooks/use-diet-meals-state';
import { useTaskDisciplineChart } from '@/hooks/use-task-discipline-chart';

export function useDietDashboardState() {
  const mealsState = useDietMealsState();
  const macroView = useDietMacroView(mealsState.data.meals);
  const disciplineChart = useTaskDisciplineChart({ days: 7, tab: 'diet', fixedPeriod: true });

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
        bars: disciplineChart.days.map((day) => ({
          label: day.label,
          heightPercent: day.percent,
        })),
        loading: disciplineChart.loading,
      },
    },
    actions: mealsState.actions,
    ui: mealsState.ui,
  };
}

export type DietDashboardState = ReturnType<typeof useDietDashboardState>;
