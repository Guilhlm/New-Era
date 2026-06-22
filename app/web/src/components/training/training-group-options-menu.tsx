'use client';

import { createEntityOptionsLabels } from '@/components/ui/entity-options-labels';
import { EntityOptionsMenu } from '@/components/ui/entity-options-menu';

const GROUP_OPTIONS_LABELS = createEntityOptionsLabels({
  noun: 'group',
  triggerAriaLabel: 'Group options',
  deleteHint: 'Exercises in this group will also be removed.',
});

type TrainingGroupOptionsMenuProps = {
  groupName: string;
  onRename: (name: string) => void;
  onDelete: () => void;
  disabled?: boolean;
};

export function TrainingGroupOptionsMenu({
  groupName,
  onRename,
  onDelete,
  disabled = false,
}: TrainingGroupOptionsMenuProps) {
  return (
    <EntityOptionsMenu
      entityName={groupName}
      onRename={onRename}
      onDelete={onDelete}
      disabled={disabled}
      labels={GROUP_OPTIONS_LABELS}
    />
  );
}
