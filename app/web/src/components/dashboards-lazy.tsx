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
