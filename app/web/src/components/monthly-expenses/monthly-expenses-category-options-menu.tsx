'use client';

import { EntityOptionsMenu } from '@/components/ui/entity-options-menu';

const CATEGORY_OPTIONS_LABELS = {
  triggerAriaLabel: 'Category options',
  rename: 'Rename',
  delete: 'Delete category',
  renameTitle: 'Rename category',
  deleteTitle: 'Delete category',
  deleteDescription: (entityName: string) =>
    `Are you sure you want to delete ${entityName}? Linked transactions will not be removed.`,
  save: 'Save',
  cancel: 'Cancel',
  confirmDelete: 'Delete',
} as const;

type MonthlyExpensesCategoryOptionsMenuProps = {
  categoryName: string;
  onRename: (name: string) => void;
  onDelete: () => void;
  disabled?: boolean;
  compact?: boolean;
  fullWidth?: boolean;
  triggerLabel?: string;
};

export function MonthlyExpensesCategoryOptionsMenu({
  categoryName,
  onRename,
  onDelete,
  disabled = false,
  compact = false,
  fullWidth = false,
  triggerLabel,
}: MonthlyExpensesCategoryOptionsMenuProps) {
  return (
    <EntityOptionsMenu
      entityName={categoryName}
      onRename={onRename}
      onDelete={onDelete}
      disabled={disabled}
      compact={compact}
      fullWidth={fullWidth}
      triggerLabel={triggerLabel}
      labels={CATEGORY_OPTIONS_LABELS}
    />
  );
}
