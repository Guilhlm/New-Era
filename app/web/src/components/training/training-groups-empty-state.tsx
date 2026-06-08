'use client';

import { EntityEmptyState } from '@/components/ui/entity-empty-state';

type TrainingGroupsEmptyStateProps = {
  onCreateGroup: () => void;
  className?: string;
  style?: React.CSSProperties;
};

export function TrainingGroupsEmptyState({
  onCreateGroup,
  className,
  style,
}: TrainingGroupsEmptyStateProps) {
  return (
    <EntityEmptyState
      title="No muscle groups yet"
      description="Create your first group to start building today&apos;s workout."
      actionLabel="+ New Exercicie Group"
      onAction={onCreateGroup}
      className={className}
      style={style}
    />
  );
}
