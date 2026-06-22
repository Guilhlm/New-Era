'use client';

import { createEntityOptionsLabels } from '@/components/ui/entity-options-labels';
import { EntityOptionsMenu } from '@/components/ui/entity-options-menu';

const MEAL_OPTIONS_LABELS = createEntityOptionsLabels({
  noun: 'meal',
  triggerAriaLabel: 'Meal options',
  deleteHint: 'Ingredients in this meal will also be removed.',
});

type DietMealOptionsMenuProps = {
  mealName: string;
  onRename: (name: string) => void;
  onDelete: () => void;
  onDuplicate?: () => void;
  disabled?: boolean;
  compact?: boolean;
  fullWidth?: boolean;
  triggerLabel?: string;
};

export function DietMealOptionsMenu({
  mealName,
  onRename,
  onDelete,
  onDuplicate,
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
      extraActions={onDuplicate ? [{ label: 'Duplicate meal', onClick: onDuplicate }] : undefined}
    />
  );
}
