'use client';

import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { MdAdd, MdChevronLeft, MdChevronRight, MdDelete, MdEdit } from 'react-icons/md';
import { FinanceGoalRecentActivities } from '@/components/finance-goals/finance-goal-recent-activities';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/cn';
import { NativeDialog } from '@/components/ui/native-dialog';
import {
  classifyGoalPace,
  computeGoalPercent,
  computeGoalRemaining,
  computeMonthlySavingsNeeded,
  monthsUntilGoalDeadline,
  type FinanceGoalVm,
} from '@/components/finance-goals/finance-goals-types';
import { typeClass, typeToneClass } from '@/lib/typography';
import { formatWalletAmount } from '@/utils/wallet';
import { walletDialogFieldClass, walletDialogSelectClass } from '@/components/wallet/wallet-dialog-layout';
import type { UpdateFinancialGoalProgressInput } from '@/types/finance';

type FinanceGoalsManageSectionProps = {
  goals: FinanceGoalVm[];
  selectedGoalId: string | null;
  onSelectGoal: (goalId: string) => void;
  onEdit: (goal: FinanceGoalVm) => void;
  onContribute: (goalId: string, input: UpdateFinancialGoalProgressInput) => void;
  onDeleteActivity: (goalId: string, activityId: string) => void;
  onDelete: (goalId: string) => void;
  className?: string;
};

const navButtonClass =
  'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-text/70 transition-colors hover:bg-red/15 hover:text-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red/60 active:scale-95 disabled:opacity-50';

function paceTone(status: ReturnType<typeof classifyGoalPace>['status']) {
  if (status === 'completed' || status === 'on_track') return 'text-green bg-green/10';
  if (status === 'urgent') return 'text-red bg-red/10';
  return 'text-text/75 bg-layer2-half';
}

function parseAmountInput(value: string) {
  const parsed = Number(value.trim().replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

export function FinanceGoalsManageSection({
  goals,
  selectedGoalId,
  onSelectGoal,
  onEdit,
  onContribute,
  onDeleteActivity,
  onDelete,
  className,
}: FinanceGoalsManageSectionProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [contributeOpen, setContributeOpen] = useState(false);
  const [contributionAmount, setContributionAmount] = useState('');
  const [contributionLabel, setContributionLabel] = useState('');
  const selectedIndex = useMemo(() => {
    if (goals.length === 0) return -1;
    const index = goals.findIndex((goal) => goal.id === selectedGoalId);
    return index >= 0 ? index : 0;
  }, [goals, selectedGoalId]);

  const selectedGoal = selectedIndex >= 0 ? goals[selectedIndex]! : null;
  const recentActivities = useMemo(
    () => selectedGoal?.activities ?? [],
    [selectedGoal],
  );

  const selectByIndex = (index: number) => {
    const goal = goals[index];
    if (goal) onSelectGoal(goal.id);
  };

  const goPrev = () => {
    if (goals.length === 0) return;
    const nextIndex = selectedIndex <= 0 ? goals.length - 1 : selectedIndex - 1;
    selectByIndex(nextIndex);
  };

  const goNext = () => {
    if (goals.length === 0) return;
    const nextIndex = selectedIndex >= goals.length - 1 ? 0 : selectedIndex + 1;
    selectByIndex(nextIndex);
  };

  if (goals.length === 0) {
    return (
      <div className={cn('flex h-full min-h-0 flex-col justify-center', className)}>
        <p className={cn('text-center', typeClass.caption, typeToneClass.muted60)}>
          Create a goal to edit or delete.
        </p>
      </div>
    );
  }

  if (!selectedGoal) return null;

  const percent = computeGoalPercent(selectedGoal);
  const remaining = computeGoalRemaining(selectedGoal);
  const monthlyNeeded = computeMonthlySavingsNeeded(selectedGoal);
  const pace = classifyGoalPace(selectedGoal);
  const monthsUntil = monthsUntilGoalDeadline(selectedGoal.deadline);
  const Icon = selectedGoal.icon;
  const parsedContributionAmount = parseAmountInput(contributionAmount);
  const canContribute =
    !selectedGoal.isLocked &&
    parsedContributionAmount != null &&
    parsedContributionAmount > 0 &&
    selectedGoal.current + parsedContributionAmount <= selectedGoal.target;

  const closeContributionDialog = () => {
    setContributeOpen(false);
    setContributionAmount('');
    setContributionLabel('');
  };

  const handleContributionSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canContribute || parsedContributionAmount == null) return;
    onContribute(selectedGoal.id, {
      amount: parsedContributionAmount,
      mode: 'add',
      label: contributionLabel.trim() || 'Aporte',
    });
    closeContributionDialog();
  };

  return (
    <div className={cn('flex h-full min-h-0 flex-col overflow-hidden', className)}>
      <div
        className="flex shrink-0 items-center rounded-lg bg-layer2-half p-1"
        role="group"
        aria-label="Select goal to manage"
      >
        <button type="button" aria-label="Previous goal" disabled={goals.length <= 1} className={navButtonClass} onClick={goPrev}>
          <MdChevronLeft className="h-5 w-5" aria-hidden />
        </button>

        <div className="flex min-w-0 flex-1 items-center justify-center gap-2 px-1">
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[5px]"
            style={{ backgroundColor: selectedGoal.accent.color }}
          >
            <Icon className="h-3.5 w-3.5 text-white" aria-hidden />
          </span>
          <span className={cn('min-w-0 truncate text-center', typeClass.body, typeToneClass.default)}>
            {selectedGoal.label}
          </span>
        </div>

        <button type="button" aria-label="Next goal" disabled={goals.length <= 1} className={navButtonClass} onClick={goNext}>
          <MdChevronRight className="h-5 w-5" aria-hidden />
        </button>
      </div>

      <div className="mt-5 flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0">
          <div className="flex items-center justify-between gap-3">
            <span className={cn('rounded-full px-2 py-0.5', typeClass.micro, paceTone(pace.status))}>{pace.label}</span>
            <span className={cn('shrink-0 tabular-nums', typeClass.micro, typeToneClass.muted60)}>
              {monthsUntil !== null ? `${monthsUntil} months` : selectedGoal.deadline}
            </span>
          </div>

          <div className={cn('mt-5 flex items-start justify-between gap-6', typeClass.caption, typeToneClass.muted60)}>
            <div className="min-w-0">
              <p className={cn(typeClass.micro, typeToneClass.muted60)}>Saved</p>
              <p className={cn('mt-0.5 truncate tabular-nums', typeClass.caption, typeToneClass.default)}>
                {formatWalletAmount(selectedGoal.current)}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className={cn(typeClass.micro, typeToneClass.muted60)}>Remaining</p>
              <p className={cn('mt-0.5 tabular-nums', typeClass.caption, typeToneClass.default)}>
                {formatWalletAmount(remaining)}
              </p>
            </div>
          </div>

          <div className={cn('mt-2 flex items-start justify-between gap-6', typeClass.caption, typeToneClass.muted60)}>
            <div className="min-w-0">
              <p className={cn(typeClass.micro, typeToneClass.muted60)}>Target</p>
              <p className={cn('mt-0.5 truncate tabular-nums', typeClass.caption, typeToneClass.default)}>
                {formatWalletAmount(selectedGoal.target)}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className={cn(typeClass.micro, typeToneClass.muted60)}>Per month</p>
              <p className={cn('mt-0.5 tabular-nums', typeClass.caption, typeToneClass.default)}>
                {formatWalletAmount(monthlyNeeded)}
              </p>
            </div>
          </div>

          <p className={cn('mt-6 text-right tabular-nums', typeClass.title)} style={{ color: selectedGoal.accent.color }}>
            {percent}%
          </p>

          <div className="mt-2 h-1.5 w-full rounded-full bg-layer2">
            <div
              className={cn('h-1.5 rounded-full', selectedGoal.accent.barClassName)}
              style={{ width: `${percent}%` }}
              aria-hidden
            />
          </div>
        </div>

        <div className="my-3 h-px w-full shrink-0 bg-layer2-half" />

        <FinanceGoalRecentActivities
          activities={recentActivities}
          onDelete={(activityId) => onDeleteActivity(selectedGoal.id, activityId)}
        />
      </div>

      <div className="mt-2.5 flex w-full shrink-0 gap-1.5">
        <Button
          type="button"
          variant="primary"
          size="sm"
          disabled={Boolean(selectedGoal.isLocked)}
          className="h-9 flex-1 gap-1.5 rounded-[5px]"
          onClick={() => setContributeOpen(true)}
        >
          <MdAdd className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Contribute
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="h-9 flex-1 gap-1.5 rounded-[5px]"
          onClick={() => onEdit(selectedGoal)}
        >
          <MdEdit className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Edit
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled={Boolean(selectedGoal.isLocked)}
          className="h-9 flex-1 gap-1.5 rounded-[5px]"
          onClick={() => setDeleteOpen(true)}
        >
          <MdDelete className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Delete
        </Button>
      </div>

      <NativeDialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <form
          method="dialog"
          className="flex flex-col gap-4 p-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (selectedGoal.isLocked) {
              setDeleteOpen(false);
              return;
            }
            onDelete(selectedGoal.id);
            setDeleteOpen(false);
          }}
        >
          <div>
            <p className={cn(typeClass.title, typeToneClass.default)}>Delete goal</p>
            <p className={cn('mt-2', typeClass.body, typeToneClass.muted60)}>
              {selectedGoal.isLocked
                ? `Goal ${selectedGoal.label} is a fixed system goal and cannot be removed.`
                : `Are you sure you want to delete ${selectedGoal.label}? The saved amount will be lost in this view.`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="destructive" size="sm" className="flex-1">
              Delete
            </Button>
            <Button type="button" variant="secondary" size="sm" className="flex-1" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </NativeDialog>

      <NativeDialog open={contributeOpen} onClose={closeContributionDialog} size="wide">
        <form method="dialog" className="flex flex-col gap-4 p-5" onSubmit={handleContributionSubmit}>
          <div>
            <p className={cn(typeClass.title, typeToneClass.default)}>Contribute to goal</p>
            <p className={cn('mt-2', typeClass.body, typeToneClass.muted60)}>
              The amount will be recorded as a monthly expense and will reduce your remaining budget balance.
            </p>
          </div>

          <label className={walletDialogFieldClass}>
            <span className={cn(typeClass.caption, typeToneClass.muted60)}>Contribution amount</span>
            <input
              type="text"
              inputMode="decimal"
              autoFocus
              value={contributionAmount}
              placeholder="500"
              className={cn('w-full tabular-nums placeholder:text-text/40', walletDialogSelectClass)}
              onChange={(event) => setContributionAmount(event.target.value.replace(/[^\d.,]/g, ''))}
            />
          </label>

          <label className={walletDialogFieldClass}>
            <span className={cn(typeClass.caption, typeToneClass.muted60)}>Description</span>
            <input
              type="text"
              value={contributionLabel}
              placeholder={`Contribution to ${selectedGoal.label}`}
              className={cn('w-full placeholder:text-text/40', walletDialogSelectClass)}
              onChange={(event) => setContributionLabel(event.target.value)}
            />
          </label>

          {parsedContributionAmount != null && selectedGoal.current + parsedContributionAmount > selectedGoal.target ? (
            <p className={cn(typeClass.micro, 'text-red')}>
              The contribution cannot exceed the remaining goal amount.
            </p>
          ) : null}

          <div className="flex gap-2">
            <Button type="submit" variant="primary" size="sm" disabled={!canContribute} className="flex-1 whitespace-nowrap">
              Confirm contribution
            </Button>
            <Button type="button" variant="secondary" size="sm" className="flex-1" onClick={closeContributionDialog}>
              Cancel
            </Button>
          </div>
        </form>
      </NativeDialog>
    </div>
  );
}
