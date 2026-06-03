'use client';

import { ActivityChartCard } from '@/components/perfil/activity-chart-card';
import { useProfileChart } from '@/hooks/use-profile-chart';

type HomeActivityChartProps = {
  style?: React.CSSProperties;
};

export function HomeActivityChart({ style }: HomeActivityChartProps) {
  const chart = useProfileChart();
  return (
    <ActivityChartCard
      chart={chart}
      style={style}
      filters={{
        showTab: false,
        leftSlot: <span className="text-xl font-semibold text-[color:var(--color-text-60)]">Discipline Level</span>,
      }}
    />
  );
}

