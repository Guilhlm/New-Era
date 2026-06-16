'use client';

import { useTaskDisciplineChart } from '@/hooks/use-task-discipline-chart';
import {
  useProfileFinancialChart,
  type ProfileFinancialChartState,
} from '@/hooks/use-profile-financial-chart';

export function useProfileChart() {
  const discipline = useTaskDisciplineChart();
  const financial = useProfileFinancialChart(
    discipline.period,
    discipline.chartTab === 'financial',
  );

  return {
    ...discipline,
    financial,
  };
}

export type ProfileChartState = ReturnType<typeof useProfileChart>;
export type { ProfileFinancialChartState };
