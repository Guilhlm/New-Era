'use client';

import { EntityOptionsMenu } from '@/components/ui/entity-options-menu';

const MEAL_OPTIONS_LABELS = {
  triggerAriaLabel: 'Meal options',
  rename: 'Rename',
  delete: 'Delete meal',
  renameTitle: 'Rename meal',
  deleteTitle: 'Delete meal',
  deleteDescription: (entityName: string) =>
    `Are you sure you want to delete ${entityName}? Ingredients in this meal will also be removed.`,
  save: 'Save',
  cancel: 'Cancel',
  confirmDelete: 'Delete',
} as const;

type DietMealOptionsMenuProps = {
  mealName: string;
  onRename: (name: string) => void;
  onDelete: () => void;
  disabled?: boolean;
  compact?: boolean;
  fullWidth?: boolean;
  triggerLabel?: string;
};

export function DietMealOptionsMenu({
  mealName,
  onRename,
  onDelete,
  disabled = false,
  compact = false,
  fullWidth = false,
  triggerLabel,
}: DietMealOptionsMenuProps) {
  return (
    <EntityOptionsMenu
      entityName={mealName}
      onRename={onRename}
      onDelete={onDelete}
      disabled={disabled}
      compact={compact}
      fullWidth={fullWidth}
      triggerLabel={triggerLabel}
      labels={MEAL_OPTIONS_LABELS}
    />
  );
}
