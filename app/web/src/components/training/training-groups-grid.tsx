'use client';

import { useCallback } from 'react';
import { TrainingAddGroupSlot } from '@/components/training/training-add-group-slot';
import { TrainingCreateGroupDialog } from '@/components/training/training-create-group-dialog';
import { TrainingGroupCard } from '@/components/training/training-group-card';
import { TrainingGroupsEmptyState } from '@/components/training/training-groups-empty-state';
import { AccordionEntityGrid } from '@/components/ui/accordion-entity-grid';
import type { TrainingExerciseDraftVm, TrainingMuscleGroupVm } from '@/types/training';

type TrainingGroupsGridProps = {
  data: {
    groups: TrainingMuscleGroupVm[];
  };
  actions: {
    onCreateGroup: () => void;
    onConfirmCreateGroup: (name: string, timeMinutes: number | null) => void;
    onCloseCreateGroup: () => void;
    onRenameGroup: (groupId: string, name: string) => void;
    onDeleteGroup: (groupId: string) => void;
    onToggleGroupExpanded: (groupId: string) => void;
    onStartExerciseDraft: (groupId: string) => void;
    onChangeDraftField: (
      groupId: string,
      field: keyof TrainingExerciseDraftVm,
      value: string | number | null,
    ) => void;
    onConfirmDraft: (groupId: string) => void;
    onCancelDraft: (groupId: string) => void;
    onEditExercise: (groupId: string, exerciseId: string) => void;
  };
  ui?: {
    loading?: boolean;
    saving?: boolean;
    createGroupOpen?: boolean;
  };
  className?: string;
  style?: React.CSSProperties;
};

export function TrainingGroupsGrid({
  data,
  actions,
  ui,
  className,
  style,
}: TrainingGroupsGridProps) {
  const getExpandedBodyCount = useCallback(
    (group: TrainingMuscleGroupVm) =>
      group.exercises.filter((exercise) => exercise.status === 'saved').length,
    [],
  );
  const hasDraft = useCallback((group: TrainingMuscleGroupVm) => Boolean(group.draft), []);

  return (
    <AccordionEntityGrid
      items={data.groups}
      loading={ui?.loading}
      loadingLabel="Loading workout…"
      hiddenHintLabel={(count) =>
        `+${count} group${count === 1 ? '' : 's'} below — collapse to see`
      }
      getExpandedBodyCount={getExpandedBodyCount}
      hasDraft={hasDraft}
      className={className}
      style={style}
      renderCreateDialog={() => (
        <TrainingCreateGroupDialog
          open={Boolean(ui?.createGroupOpen)}
          saving={ui?.saving}
          onClose={actions.onCloseCreateGroup}
          onCreate={actions.onConfirmCreateGroup}
        />
      )}
      renderEmpty={() => (
        <TrainingGroupsEmptyState
          onCreateGroup={actions.onCreateGroup}
          className={className}
          style={style}
        />
      )}
      renderAddSlot={() => (
        <TrainingAddGroupSlot onAddGroup={actions.onCreateGroup} className="h-full min-h-[72px]" />
      )}
      renderRow={({ item: group, isExpanded, expandedScrolls, bodyMaxHeight, bindHeaderRef, bindBodyRef }) => (
        <TrainingGroupCard
          data={group}
          ui={{
            disabled: ui?.loading,
            saving: ui?.saving,
            expandedScrolls: isExpanded ? expandedScrolls : undefined,
            bodyMaxHeight: isExpanded ? bodyMaxHeight : undefined,
          }}
          bindHeaderRef={bindHeaderRef}
          bindBodyRef={bindBodyRef}
          actions={{
            onToggleExpanded: () => actions.onToggleGroupExpanded(group.id),
            onAddExercise: () => actions.onStartExerciseDraft(group.id),
            onRenameGroup: (name) => actions.onRenameGroup(group.id, name),
            onDeleteGroup: () => actions.onDeleteGroup(group.id),
            onChangeDraftField: (field, value) =>
              actions.onChangeDraftField(group.id, field, value),
            onConfirmDraft: () => actions.onConfirmDraft(group.id),
            onCancelDraft: () => actions.onCancelDraft(group.id),
            onEditExercise: (exerciseId) => actions.onEditExercise(group.id, exerciseId),
          }}
        />
      )}
    />
  );
}
