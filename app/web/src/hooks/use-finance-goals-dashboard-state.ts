'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import {
  MdFlight,
  MdHome,
  MdLaptopMac,
  MdSavings,
} from 'react-icons/md';
import {
  FINANCE_GOAL_ACCENT_PRESETS,
  type FinanceGoalVm,
} from '@/components/finance-goals/finance-goals-types';
import { useDashboardMutation } from '@/hooks/use-dashboard-mutation';
import { queryKeys } from '@/lib/query-keys';
import {
  completeFinancialGoal,
  createFinancialGoal,
  deleteFinancialGoal,
  deleteFinancialGoalActivity,
  getFinancialGoals,
  updateFinancialGoal,
  updateFinancialGoalProgress,
} from '@/services/finance';
import { HttpError } from '@/services/http';
import type {
  CreateFinancialGoalInput,
  UpdateFinancialGoalInput,
  UpdateFinancialGoalProgressInput,
} from '@/types/finance';

function formatGoalDeadline(deadline: string | null) {
  if (!deadline) return 'No deadline';
  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) return 'No deadline';
  const short = date
    .toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    .replace('.', '');
  const [month, year] = short.split(' ');
  return `${month?.slice(0, 3) ?? '---'}/${year ?? ''}`;
}

function pickGoalIcon(goal: { title: string; systemKey: string | null }) {
  const key = goal.systemKey?.toUpperCase() ?? '';
  const title = goal.title.toLowerCase();
  if (key === 'INVESTMENTS' || title.includes('reserva')) return MdSavings;
  if (title.includes('viagem')) return MdFlight;
  if (title.includes('casa') || title.includes('apartamento')) return MdHome;
  if (title.includes('notebook') || title.includes('laptop')) return MdLaptopMac;
  return MdSavings;
}

export function useFinanceGoalsDashboardState() {
  const queryClient = useQueryClient();
  const [sortKey, setSortKey] = useState<'progress' | 'name' | 'deadline' | 'target'>(
    'progress',
  );

  const goalsQuery = useQuery({
    queryKey: queryKeys.financeGoals(sortKey),
    queryFn: () => getFinancialGoals(sortKey),
    staleTime: 20_000,
  });

  const createGoalMutation = useMutation({
    mutationFn: (input: CreateFinancialGoalInput) => createFinancialGoal(input),
  });
  const updateGoalMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateFinancialGoalInput }) =>
      updateFinancialGoal(id, input),
  });
  const deleteGoalMutation = useMutation({
    mutationFn: (id: string) => deleteFinancialGoal(id),
  });
  const updateProgressMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateFinancialGoalProgressInput }) =>
      updateFinancialGoalProgress(id, input),
  });
  const completeGoalMutation = useMutation({
    mutationFn: (id: string) => completeFinancialGoal(id),
  });
  const deleteActivityMutation = useMutation({
    mutationFn: ({ goalId, activityId }: { goalId: string; activityId: string }) =>
      deleteFinancialGoalActivity(goalId, activityId),
  });

  async function invalidateGoalCaches() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.financeGoals() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.walletSummary() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.wallets }),
      queryClient.invalidateQueries({ queryKey: queryKeys.monthlyExpensesAll }),
      queryClient.invalidateQueries({ queryKey: queryKeys.monthlyExpenseCategories() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.notificationsUnreadCount }),
    ]);
  }

  const { run, isPending, saving } = useDashboardMutation({
    onSuccess: invalidateGoalCaches,
  });

  const goals = useMemo<FinanceGoalVm[]>(
    () =>
      (goalsQuery.data?.goals ?? [])
        .filter((goal) => !goal.isSystem)
        .map((goal, index) => ({
        id: goal.id,
        label: goal.title,
        description: goal.description || 'Custom financial goal.',
        target: goal.targetAmount,
        current: goal.currentAmount,
        deadline: formatGoalDeadline(goal.deadline),
        icon: pickGoalIcon(goal),
        accent: FINANCE_GOAL_ACCENT_PRESETS[index % FINANCE_GOAL_ACCENT_PRESETS.length]!,
        isSystem: goal.isSystem,
        isLocked: goal.isLocked,
        activities: goal.activities.map((activity) => ({
          id: activity.id,
          label: activity.label,
          date: new Date(activity.date).toLocaleDateString('en-US', {
            day: '2-digit',
            month: '2-digit',
          }),
          amount: activity.amount,
          canDelete: activity.canDelete,
        })),
        })),
    [goalsQuery.data?.goals],
  );

  const trends = goalsQuery.data?.trends ?? { saved: 0, progress: 0 };

  return {
    data: {
      goals,
      trends,
      sortKey,
    },
    actions: {
      setSortKey,
      createGoal: (input: CreateFinancialGoalInput) =>
        run('goal', () => createGoalMutation.mutateAsync(input), 'Meta criada.'),
      updateGoal: (id: string, input: UpdateFinancialGoalInput) =>
        run('goal', () => updateGoalMutation.mutateAsync({ id, input }), 'Meta atualizada.'),
      deleteGoal: (id: string) =>
        run('goal', () => deleteGoalMutation.mutateAsync(id), 'Meta removida.'),
      updateProgress: (id: string, input: UpdateFinancialGoalProgressInput) =>
        run('goal', () => updateProgressMutation.mutateAsync({ id, input }), 'Progresso atualizado.'),
      completeGoal: (id: string) =>
        run('goal', () => completeGoalMutation.mutateAsync(id), 'Meta concluída.'),
      deleteActivity: (goalId: string, activityId: string) =>
        run(
          'goal',
          () => deleteActivityMutation.mutateAsync({ goalId, activityId }),
          'Contribuição removida.',
        ),
    },
    ui: {
      loading: goalsQuery.isPending,
      saving,
      isPending,
      error:
        goalsQuery.error instanceof HttpError
          ? goalsQuery.error.message
          : goalsQuery.error
            ? 'Failed to load goals.'
            : null,
    },
  };
}
