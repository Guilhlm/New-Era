'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';
import { FinanceGoalsManageSection } from '@/components/finance-goals/finance-goals-manage-section';
import type { FinanceGoalVm } from '@/components/finance-goals/finance-goals-types';
import type { UpdateFinancialGoalProgressInput } from '@/types/finance';

type FinanceGoalsManageCardProps = {
  goals: FinanceGoalVm[];
  selectedGoalId: string | null;
  onSelectGoal: (goalId: string) => void;
  onEdit: (goal: FinanceGoalVm) => void;
  onContribute: (goalId: string, input: UpdateFinancialGoalProgressInput) => void;
  onDeleteActivity: (goalId: string, activityId: string) => void;
  onDelete: (goalId: string) => void;
  className?: string;
};

export function FinanceGoalsManageCard({
  goals,
  selectedGoalId,
  onSelectGoal,
  onEdit,
  onContribute,
  onDeleteActivity,
  onDelete,
  className,
}: FinanceGoalsManageCardProps) {
  return (
    <Card className={cn('flex h-full min-h-0 flex-col overflow-hidden p-5 lg:p-6', className)}>
      <FinanceGoalsManageSection
        className="min-h-0 flex-1 overflow-hidden"
        goals={goals}
        selectedGoalId={selectedGoalId}
        onSelectGoal={onSelectGoal}
        onEdit={onEdit}
        onContribute={onContribute}
        onDeleteActivity={onDeleteActivity}
        onDelete={onDelete}
      />
    </Card>
  );
}
