import type { QueryClient } from '@tanstack/react-query';
import { getCalendarWeekday } from '@/hooks/use-calendar-day-change';
import { queryKeys } from '@/lib/query-keys';
import { getLatestBodyMeasure, getBodyMeasureHistory, getLatestBodyVital } from '@/services/body-measure';
import { getDietDay } from '@/services/diet';
import { getFinancialGoals, getMonthlyExpenses } from '@/services/finance';
import { getNotifications } from '@/services/notifications';
import { getTasksDay, getTasksSummary, getTasksToday, getTaskDisciplineHistory } from '@/services/task';
import { getWorkoutDay, getWorkoutPlanSummary } from '@/services/workout';

/** Prefetch primary queries for a main route (respects React Query staleTime). */
export function prefetchRouteData(queryClient: QueryClient, href: string) {
  const weekday = getCalendarWeekday();

  switch (href) {
    case '/':
      void queryClient.prefetchQuery({
        queryKey: queryKeys.tasksToday,
        queryFn: getTasksToday,
      });
      void queryClient.prefetchQuery({
        queryKey: queryKeys.discipline('training', 7),
        queryFn: async () => {
          const { days } = await getTaskDisciplineHistory(7, 'training');
          return days;
        },
      });
      break;
    case '/body-metrics':
      void queryClient.prefetchQuery({
        queryKey: queryKeys.bodyMeasureLatest,
        queryFn: getLatestBodyMeasure,
      });
      void queryClient.prefetchQuery({
        queryKey: queryKeys.bodyMeasureHistory,
        queryFn: async () => {
          const { measures } = await getBodyMeasureHistory();
          return measures.filter(Boolean);
        },
      });
      void queryClient.prefetchQuery({
        queryKey: queryKeys.bodyVitalLatest,
        queryFn: getLatestBodyVital,
      });
      break;
    case '/diet-area':
      void queryClient.prefetchQuery({
        queryKey: queryKeys.dietDay(weekday),
        queryFn: async () => {
          const { meals } = await getDietDay(weekday);
          return meals;
        },
      });
      break;
    case '/training-area':
      void queryClient.prefetchQuery({
        queryKey: queryKeys.workoutDay(weekday),
        queryFn: async () => {
          const { plan } = await getWorkoutDay(weekday);
          return plan;
        },
      });
      void queryClient.prefetchQuery({
        queryKey: queryKeys.workoutPlan,
        queryFn: getWorkoutPlanSummary,
      });
      break;
    case '/create-tasks':
      void queryClient.prefetchQuery({
        queryKey: queryKeys.taskDay(weekday),
        queryFn: async () => {
          const { tasks } = await getTasksDay(weekday);
          return tasks;
        },
      });
      void queryClient.prefetchQuery({
        queryKey: queryKeys.taskWeekdaySummary,
        queryFn: getTasksSummary,
      });
      break;
    case '/monthly-expenses':
      void queryClient.prefetchQuery({
        queryKey: queryKeys.monthlyExpenses(),
        queryFn: () => getMonthlyExpenses(),
      });
      break;
    case '/finance-goals':
      void queryClient.prefetchQuery({
        queryKey: queryKeys.financeGoals(),
        queryFn: () => getFinancialGoals('progress'),
      });
      break;
    case '/notifications':
      void queryClient.prefetchQuery({
        queryKey: queryKeys.notifications(),
        queryFn: () => getNotifications({ limit: 100 }),
      });
      break;
    default:
      break;
  }
}
