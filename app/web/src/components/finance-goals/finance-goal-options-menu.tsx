'use client';

import { createEntityOptionsLabels } from '@/components/ui/entity-options-labels';
import { EntityOptionsMenu } from '@/components/ui/entity-options-menu';

const GOAL_OPTIONS_LABELS = createEntityOptionsLabels({
  noun: 'goal',
  triggerAriaLabel: 'Goal options',
  deleteHint: 'The saved amount will be lost in this view.',
});

type FinanceGoalOptionsMenuProps = {
  goalName: string;
  onRename: (name: string) => void;
  onDelete: () => void;
  disabled?: boolean;
  compact?: boolean;
  fullWidth?: boolean;
  triggerLabel?: string;
};

export function FinanceGoalOptionsMenu({
  goalName,
  onRename,
  onDelete,
  disabled = false,
  compact = false,
  fullWidth = false,
  triggerLabel,
}: FinanceGoalOptionsMenuProps) {
  return (
    <EntityOptionsMenu
      entityName={goalName}
      onRename={onRename}
      onDelete={onDelete}
      disabled={disabled}
      compact={compact}
      fullWidth={fullWidth}
      triggerLabel={triggerLabel}
      labels={GOAL_OPTIONS_LABELS}
    />
  );
}
