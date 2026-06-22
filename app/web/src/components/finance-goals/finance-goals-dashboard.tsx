'use client';

import { useMemo, useState } from 'react';
import {
  DashboardSidebarColumn,
  DashboardTwoColumnLayout,
  dashboardGridArea,
} from '@/components/ui/dashboard-two-column-layout';
import { FinanceGoalsActiveList } from '@/components/finance-goals/finance-goals-active-list';
import { FinanceGoalDialog } from '@/components/finance-goals/finance-goal-dialog';
import { FinanceGoalsDistributionCard } from '@/components/finance-goals/finance-goals-distribution-card';
import { FinanceGoalsManageCard } from '@/components/finance-goals/finance-goals-manage-card';
import {
  type FinanceGoalVm,
} from '@/components/finance-goals/finance-goals-types';
import { useFinanceGoalsDashboardState } from '@/hooks/use-finance-goals-dashboard-state';
import { PlanHeaderCard } from '@/components/ui/plan-header-card';
import { StatProgressCard } from '@/components/ui/stat-progress-card';
import { formatBrlAmount } from '@/utils/wallet';

function formatTrendLabel(value: number) {
  if (value === 0) return 'No change vs last month';
  return `${value >= 0 ? '↑' : '↓'} ${Math.abs(value).toLocaleString('en-US', { maximumFractionDigits: 1 })}% vs last month`;
}

export function FinanceGoalsDashboard() {
  const state = useFinanceGoalsDashboardState();
  const goals = state.data.goals;
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(goals[0]?.id ?? null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingGoal, setEditingGoal] = useState<FinanceGoalVm | null>(null);

  const resolvedSelectedGoalId =
    selectedGoalId && goals.some((goal) => goal.id === selectedGoalId)
      ? selectedGoalId
      : goals[0]?.id ?? null;

  const totals = useMemo(() => {
    const totalSaved = goals.reduce((sum, goal) => sum + goal.current, 0);
    const totalTarget = goals.reduce((sum, goal) => sum + goal.target, 0);
    const avgProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;
    const savedPercent = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;
    return { totalSaved, totalTarget, avgProgress, savedPercent, activeCount: goals.length };
  }, [goals]);

  const openCreate = () => {
    setDialogMode('create');
    setEditingGoal(null);
    setDialogOpen(true);
  };

  const openEdit = (goal: FinanceGoalVm) => {
    setDialogMode('edit');
    setEditingGoal(goal);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingGoal(null);
  };

  const handleGoalsChange = (nextGoals: FinanceGoalVm[]) => {
    if (selectedGoalId && !nextGoals.some((goal) => goal.id === selectedGoalId)) {
      setSelectedGoalId(nextGoals[0]?.id ?? null);
    }
  };

  const parseDeadlineInput = (input: string) => {
    const normalized = input.trim();
    if (!normalized) return undefined;
    const monthMap: Record<string, number> = {
      jan: 0,
      feb: 1,
      mar: 2,
      apr: 3,
      may: 4,
      jun: 5,
      jul: 6,
      aug: 7,
      sep: 8,
      oct: 9,
      nov: 10,
      dec: 11,
    };
    const mmYyyy = normalized.match(/^([A-Za-z]{3})\/(\d{4})$/);
    if (mmYyyy) {
      const month = monthMap[mmYyyy[1]!.toLowerCase()];
      const year = Number(mmYyyy[2]);
      if (month !== undefined && Number.isFinite(year)) {
        return new Date(Date.UTC(year, month, 1)).toISOString();
      }
    }
    const parsed = new Date(normalized);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
    return undefined;
  };

  const handleCreateOrUpdate = (values: {
    label: string;
    description: string;
    target: number;
    current: number;
    deadline: string;
  }) => {
    const deadlineIso = parseDeadlineInput(values.deadline);
    if (dialogMode === 'create') {
      void state.actions.createGoal({
        title: values.label,
        description: values.description,
        targetAmount: values.target,
        currentAmount: values.current,
        deadline: deadlineIso,
      });
    } else if (editingGoal) {
      void state.actions.updateGoal(editingGoal.id, {
        title: values.label,
        description: values.description,
        targetAmount: values.target,
        currentAmount: values.current,
        deadline: deadlineIso,
      });
    }
    closeDialog();
  };

  const handleDelete = (goalId: string) => {
    void state.actions.deleteGoal(goalId);
    handleGoalsChange(goals.filter((goal) => goal.id !== goalId));
  };

  const handleContribute = (
    goalId: string,
    input: Parameters<typeof state.actions.updateProgress>[1],
  ) => {
    void state.actions.updateProgress(goalId, input);
  };

  const handleDeleteActivity = (goalId: string, activityId: string) => {
    void state.actions.deleteActivity(goalId, activityId);
  };

  const dialogInitial = useMemo(
    () => ({
      label: editingGoal?.label ?? '',
      description: editingGoal?.description ?? '',
      target: editingGoal ? String(editingGoal.target) : '',
      current: editingGoal ? String(editingGoal.current) : '0',
      deadline: editingGoal?.deadline ?? '',
      locked: editingGoal?.isLocked,
    }),
    [editingGoal],
  );

  return (
    <>
      <DashboardTwoColumnLayout>
        <PlanHeaderCard
          title="Financial Goals"
          className="h-full min-h-0"
          style={dashboardGridArea('main', 'header')}
          rightSlot={null}
          statsSlot={
            <>
              <StatProgressCard
                className="min-w-0"
                data={{
                  label: 'Total saved',
                  valueLabel: formatBrlAmount(totals.totalSaved),
                  percent: totals.savedPercent,
                  barClassName: 'bg-red',
                  footerRight: formatTrendLabel(state.data.trends.saved),
                }}
              />
              <StatProgressCard
                className="min-w-0"
                data={{
                  label: 'Combined target',
                  valueLabel: formatBrlAmount(totals.totalTarget),
                  percent: 100,
                  barClassName: 'bg-text/25',
                  footerRight: `${totals.activeCount} ${totals.activeCount === 1 ? 'active goal' : 'active goals'}`,
                }}
              />
              <StatProgressCard
                className="min-w-0"
                data={{
                  label: 'Average progress',
                  valueLabel: `${totals.avgProgress}%`,
                  percent: totals.avgProgress,
                  barClassName: 'bg-green',
                  valueClassName: 'text-green',
                  footerRight: formatTrendLabel(state.data.trends.progress),
                }}
              />
            </>
          }
        />

        <FinanceGoalsActiveList
          goals={goals}
          onCreate={openCreate}
          className="h-full min-h-0"
          style={dashboardGridArea('main', 'body')}
        />

        <DashboardSidebarColumn className="grid grid-rows-[minmax(0,2fr)_minmax(0,3fr)]">
          <FinanceGoalsDistributionCard
            goals={goals}
            totalTarget={totals.totalTarget}
            className="min-h-0"
          />
          <FinanceGoalsManageCard
            goals={goals}
            selectedGoalId={resolvedSelectedGoalId}
            onSelectGoal={setSelectedGoalId}
            onEdit={openEdit}
            onContribute={handleContribute}
            onDeleteActivity={handleDeleteActivity}
            onDelete={handleDelete}
            className="min-h-0"
          />
        </DashboardSidebarColumn>
      </DashboardTwoColumnLayout>

      <FinanceGoalDialog
        open={dialogOpen}
        mode={dialogMode}
        initial={dialogInitial}
        saving={state.ui.saving}
        onClose={closeDialog}
        onSubmit={handleCreateOrUpdate}
      />
    </>
  );
}
