'use client';

import { createEntityOptionsLabels } from '@/components/ui/entity-options-labels';
import { EntityOptionsMenu } from '@/components/ui/entity-options-menu';

const CATEGORY_OPTIONS_LABELS = createEntityOptionsLabels({
  noun: 'category',
  triggerAriaLabel: 'Category options',
  deleteHint: 'Linked transactions will not be removed.',
});

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
