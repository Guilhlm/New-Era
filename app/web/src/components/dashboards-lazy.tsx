import dynamic from 'next/dynamic';
import { DashboardSkeleton } from '@/components/ui/dashboard-skeleton';

export const BodyMetricsDashboard = dynamic(
  () =>
    import('@/components/body-metrics/body-metrics-dashboard').then(
      (m) => m.BodyMetricsDashboard,
    ),
  { loading: () => <DashboardSkeleton /> },
);

export const TaskDashboard = dynamic(
  () => import('@/components/tasks/task-dashboard').then((m) => m.TaskDashboard),
  { loading: () => <DashboardSkeleton /> },
);

export const DietDashboard = dynamic(
  () => import('@/components/diet/diet-dashboard').then((m) => m.DietDashboard),
  { loading: () => <DashboardSkeleton /> },
);

export const TrainingDashboard = dynamic(
  () =>
    import('@/components/training/training-dashboard').then((m) => m.TrainingDashboard),
  { loading: () => <DashboardSkeleton /> },
);

export const WalletDashboard = dynamic(
  () => import('@/components/wallet/wallet-dashboard').then((m) => m.WalletDashboard),
  { loading: () => <DashboardSkeleton /> },
);

export const MonthlyExpensesDashboard = dynamic(
  () =>
    import('@/components/monthly-expenses/monthly-expenses-dashboard').then(
      (m) => m.MonthlyExpensesDashboard,
    ),
  { loading: () => <DashboardSkeleton /> },
);

export const FinanceGoalsDashboard = dynamic(
  () =>
    import('@/components/finance-goals/finance-goals-dashboard').then(
      (m) => m.FinanceGoalsDashboard,
    ),
  { loading: () => <DashboardSkeleton /> },
);

export const NotificationsDashboard = dynamic(
  () =>
    import('@/components/notifications/notifications-dashboard').then(
      (m) => m.NotificationsDashboard,
    ),
  { loading: () => <DashboardSkeleton /> },
);

export const HomeTasksContainer = dynamic(
  () =>
    import('@/components/home/home-tasks-container').then(
      (m) => m.HomeTasksContainer,
    ),
  { loading: () => <DashboardSkeleton /> },
);

export const PerfilDashboard = dynamic(
  () => import('@/components/perfil/perfil-dashboard').then((m) => m.PerfilDashboard),
  { loading: () => <DashboardSkeleton /> },
);
