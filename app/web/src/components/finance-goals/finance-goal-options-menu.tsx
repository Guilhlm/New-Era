'use client';

import { EntityOptionsMenu } from '@/components/ui/entity-options-menu';

const GOAL_OPTIONS_LABELS = {
  triggerAriaLabel: 'Goal options',
  rename: 'Rename',
  delete: 'Delete goal',
  renameTitle: 'Rename goal',
  deleteTitle: 'Delete goal',
  deleteDescription: (entityName: string) =>
    `Are you sure you want to delete ${entityName}? The saved amount will be lost in this view.`,
  save: 'Save',
  cancel: 'Cancel',
  confirmDelete: 'Delete',
} as const;

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
