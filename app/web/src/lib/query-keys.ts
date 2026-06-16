import type { TaskDisciplineChartPeriod, TaskDisciplineChartTab } from '@/types/task';

/** Central registry of React Query keys to keep cache updates consistent. */
export const queryKeys = {
  me: ['me'] as const,
  tasksToday: ['tasks-today'] as const,
  disciplineAll: ['discipline'] as const,
  disciplineTab: (tab: TaskDisciplineChartTab) => ['discipline', tab] as const,
  discipline: (tab: TaskDisciplineChartTab, period: TaskDisciplineChartPeriod) =>
    ['discipline', tab, period] as const,
  taskDay: (weekday: number) => ['task-day', weekday] as const,
  dietDay: (weekday: number) => ['diet-day', weekday] as const,
  workoutDay: (weekday: number) => ['workout-day', weekday] as const,
  bodyMeasureLatest: ['body-measure-latest'] as const,
  bodyMeasureHistory: ['body-measure-history'] as const,
  bodyVitalLatest: ['body-vital-latest'] as const,
  bodyVitalHistory: ['body-vital-history'] as const,
  fitnessMacroGoal: ['fitness-macro-goal'] as const,
  waterLogDay: (date: string) => ['water-log', date] as const,
  workoutPlan: ['workout-plan'] as const,
  taskSuggestions: (weekday: number) => ['task-suggestions', weekday] as const,
  taskWeekdaySummary: ['task-weekday-summary'] as const,
  walletSummary: (period?: string) => ['wallet-summary', period ?? '1W'] as const,
  walletInvestments: (tab?: string) => ['wallet-investments', tab ?? 'all'] as const,
  walletMarket: (tab?: string, currency?: string) =>
    ['wallet-market', tab ?? 'stocks', currency ?? 'USDT'] as const,
  walletFx: ['wallet-fx'] as const,
  wallets: ['wallets'] as const,
};
