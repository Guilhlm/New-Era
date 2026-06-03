import { DisciplineOverviewCard } from '@/components/home/discipline-overview-card';
import { DailyTasksCard } from '@/components/home/daily-tasks-card';
import { HomeActivityChart } from '@/components/home/home-activity-chart';

type HomeDashboardProps = {
  discipline: {
    percent: number;
    label: string;
  };
  tasks: Array<{ rank: string; title: string; done?: boolean }>;
};

export function HomeDashboard({ discipline, tasks }: HomeDashboardProps) {
  return (
    <section
      className="flex h-full min-h-0 flex-1 flex-col gap-2.5 lg:grid lg:min-h-0 lg:flex-1 lg:gap-2.5"
      style={{
        gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
        gridTemplateRows: 'minmax(180px, auto) minmax(320px, 1fr)',
      }}
    >
      <DisciplineOverviewCard
        percent={discipline.percent}
        label={discipline.label}
        style={{ gridColumn: '1 / 5', gridRow: '1 / 2' }}
      />

      <DailyTasksCard tasks={tasks} style={{ gridColumn: '5 / 7', gridRow: '1 / 3' }} />

      <HomeActivityChart style={{ gridColumn: '1 / 5', gridRow: '2 / 3' }} />
    </section>
  );
}

