export type TaskSourceType = 'MANUAL' | 'WORKOUT' | 'DIET_MEAL';

export type TaskVm = {
  id: string;
  weekday: number;
  title: string;
  scheduledAt: string;
  sortOrder: number;
  sourceType: TaskSourceType;
  sourceId: string | null;
  done?: boolean;
  rank?: string;
};

export type TaskSuggestionVm = {
  sourceType: TaskSourceType;
  sourceId: string;
  title: string;
  defaultScheduledAt: string;
  selected?: boolean;
  scheduledAt?: string;
};

export type TaskDisciplineVm = {
  percent: number;
  label: string;
  segments: {
    total: number;
    filled: number;
  };
};

export type TaskDisciplineDayVm = {
  date: string;
  label: string;
  weekday?: number;
  percent: number;
  total: number;
  done: number;
};

export type TaskDisciplineChartTab = 'training' | 'diet' | 'financial';
export type TaskDisciplineChartPeriod = 7 | 14 | 30;

export type CreateTaskInput = {
  weekday: number;
  title: string;
  scheduledAt: string;
  sourceType?: TaskSourceType;
  sourceId?: string | null;
};

export type CreateTasksBulkInput = {
  weekday: number;
  tasks: Array<{
    title: string;
    scheduledAt: string;
    sourceType: TaskSourceType;
    sourceId: string;
  }>;
};

export type UpdateTaskInput = {
  title?: string;
  scheduledAt?: string;
  isActive?: boolean;
};

export type DailyTaskHomeVm = {
  rank: string;
  title: string;
  done?: boolean;
  id: string;
  sourceType: TaskSourceType;
};

export type TaskDaySummaryStatVm = {
  key: 'tasks' | 'completed' | 'next';
  label: string;
  valueLabel: string;
  subLabel: string;
  percent: number;
  barClassName: string;
};

export type TaskDaySummaryVm = {
  stats: TaskDaySummaryStatVm[];
};
