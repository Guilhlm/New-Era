'use client';

import { ActivityChartCard } from '@/components/perfil/activity-chart-card';
import type { TaskDisciplineChartState } from '@/hooks/use-task-discipline-chart';

type HomeActivityChartProps = {
  chart: TaskDisciplineChartState;
  style?: React.CSSProperties;
};

export function HomeActivityChart({ chart, style }: HomeActivityChartProps) {
  return (
    <ActivityChartCard
      chart={chart}
      style={style}
      filters={{
        showTab: false,
        leftSlot: <span className="type-stat text-[color:var(--color-text-60)]">Discipline Level</span>,
      }}
    />
  );
}
