'use client';

import { EntityOptionsMenu } from '@/components/ui/entity-options-menu';

const GROUP_OPTIONS_LABELS = {
  triggerAriaLabel: 'Group options',
  rename: 'Rename',
  delete: 'Delete group',
  renameTitle: 'Rename group',
  deleteTitle: 'Delete group',
  deleteDescription: (entityName: string) =>
    `Are you sure you want to delete ${entityName}? Exercises in this group will also be removed.`,
  save: 'Save',
  cancel: 'Cancel',
  confirmDelete: 'Delete',
} as const;

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
