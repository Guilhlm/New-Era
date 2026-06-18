'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import {
  MdFlight,
  MdHome,
  MdLaptopMac,
  MdSavings,
} from 'react-icons/md';
import { toastAuthError, toastUpdated } from '@/lib/app-toast';
import {
  FINANCE_GOAL_ACCENT_PRESETS,
  type FinanceGoalVm,
} from '@/components/finance-goals/finance-goals-types';
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

  const [saving, setSaving] = useState(false);
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
      queryClient.invalidateQueries({ queryKey: ['finance-goals'] }),
      queryClient.invalidateQueries({ queryKey: queryKeys.walletSummary() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.wallets }),
      queryClient.invalidateQueries({ queryKey: ['monthly-expenses'] }),
      queryClient.invalidateQueries({ queryKey: ['monthly-expense-categories'] }),
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.notificationsUnreadCount }),
    ]);
  }

  async function runMutation<T>(action: () => Promise<T>, successMessage: string) {
    setSaving(true);
    try {
      const result = await action();
      await invalidateGoalCaches();
      toastUpdated(successMessage);
      return result;
    } catch (error) {
      toastAuthError(error instanceof HttpError ? error.message : 'Request failed.');
      throw error;
    } finally {
      setSaving(false);
    }
  }

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
        runMutation(() => createGoalMutation.mutateAsync(input), 'Goal created.'),
      updateGoal: (id: string, input: UpdateFinancialGoalInput) =>
        runMutation(() => updateGoalMutation.mutateAsync({ id, input }), 'Goal updated.'),
      deleteGoal: (id: string) =>
        runMutation(() => deleteGoalMutation.mutateAsync(id), 'Goal removed.'),
      updateProgress: (id: string, input: UpdateFinancialGoalProgressInput) =>
        runMutation(
          () => updateProgressMutation.mutateAsync({ id, input }),
          'Progress updated.',
        ),
      completeGoal: (id: string) =>
        runMutation(() => completeGoalMutation.mutateAsync(id), 'Goal completed.'),
      deleteActivity: (goalId: string, activityId: string) =>
        runMutation(
          () => deleteActivityMutation.mutateAsync({ goalId, activityId }),
          'Contribution removed.',
        ),
    },
    ui: {
      loading: goalsQuery.isPending,
      saving,
      error:
        goalsQuery.error instanceof HttpError
          ? goalsQuery.error.message
          : goalsQuery.error
            ? 'Failed to load goals.'
            : null,
    },
  };
}
