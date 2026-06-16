import { DisciplineOverviewCard } from '@/components/home/discipline-overview-card';
import { DailyTasksCard } from '@/components/home/daily-tasks-card';
import { HomeActivityChart } from '@/components/home/home-activity-chart';
import type { TaskDisciplineChartState } from '@/hooks/use-task-discipline-chart';
import type { DailyTaskHomeVm } from '@/types/task';

type HomeDashboardProps = {
  discipline: {
    percent: number;
    label: string;
    segments?: {
      total: number;
      filled: number;
    };
  };
  tasks: DailyTaskHomeVm[];
  chart: TaskDisciplineChartState;
  actions: {
    onToggleDone: (taskId: string) => void;
  };
  ui?: {
    loading?: boolean;
    togglingId?: string | null;
  };
};

export function HomeDashboard({ discipline, tasks, chart, actions, ui }: HomeDashboardProps) {
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
        segments={discipline.segments}
        style={{ gridColumn: '1 / 5', gridRow: '1 / 2' }}
      />

      <DailyTasksCard
        tasks={tasks}
        actions={{ onToggleDone: actions.onToggleDone }}
        ui={ui}
        style={{ gridColumn: '5 / 7', gridRow: '1 / 3' }}
      />

      <HomeActivityChart chart={chart} style={{ gridColumn: '1 / 5', gridRow: '2 / 3' }} />
    </section>
  );
}
