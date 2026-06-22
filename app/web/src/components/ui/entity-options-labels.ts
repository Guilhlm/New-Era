import type { EntityOptionsMenuLabels } from '@/components/ui/entity-options-menu';

type EntityOptionsLabelsConfig = {
  /** Lowercase entity noun, e.g. "goal", "category", "meal". */
  noun: string;
  /** aria-label for the trigger, e.g. "Goal options". */
  triggerAriaLabel: string;
  /** Extra sentence appended to the delete confirmation. */
  deleteHint?: string;
};

/**
 * Builds the repetitive label scaffolding shared by every entity options menu,
 * so feature wrappers only declare what is actually unique (noun + hint).
 */
export function createEntityOptionsLabels({
  noun,
  triggerAriaLabel,
  deleteHint,
}: EntityOptionsLabelsConfig): EntityOptionsMenuLabels {
  return {
    triggerAriaLabel,
    rename: 'Rename',
    delete: `Delete ${noun}`,
    renameTitle: `Rename ${noun}`,
    deleteTitle: `Delete ${noun}`,
    deleteDescription: (entityName: string) =>
      `Are you sure you want to delete ${entityName}?${deleteHint ? ` ${deleteHint}` : ''}`,
    save: 'Save',
    cancel: 'Cancel',
    confirmDelete: 'Delete',
  };
}
