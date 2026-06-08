'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';
import { TrainingExerciseDraftRow } from '@/components/training/training-exercise-draft-row';
import { TrainingExerciseRow } from '@/components/training/training-exercise-row';
import { TrainingGroupCollapsedExercisesLine } from '@/components/training/training-group-collapsed-summary';
import { TrainingGroupOptionsMenu } from '@/components/training/training-group-options-menu';
import type { TrainingExerciseDraftVm, TrainingMuscleGroupVm } from '@/types/training';
import { formatGroupDurationLabel } from '@/utils/training-mapper';
import { MdExpandMore } from 'react-icons/md';

type TrainingGroupCardProps = {
  data: TrainingMuscleGroupVm;
  actions: {
    onToggleExpanded: () => void;
    onAddExercise: () => void;
    onRenameGroup: (name: string) => void;
    onDeleteGroup: () => void;
    onChangeDraftField: (
      field: keyof TrainingExerciseDraftVm,
      value: string | number | null,
    ) => void;
    onConfirmDraft: () => void;
    onCancelDraft: () => void;
    onEditExercise: (exerciseId: string) => void;
  };
  ui?: {
    disabled?: boolean;
    saving?: boolean;
    expandedScrolls?: boolean;
    bodyMaxHeight?: number;
  };
  bindHeaderRef?: React.RefObject<HTMLDivElement | null>;
  bindBodyRef?: React.RefObject<HTMLDivElement | null>;
  className?: string;
};

function GroupCardActions({
  blocked,
  hasDraft,
  groupName,
  onAddExercise,
  onRenameGroup,
  onDeleteGroup,
}: {
  blocked?: boolean;
  hasDraft: boolean;
  groupName: string;
  onAddExercise: () => void;
  onRenameGroup: (name: string) => void;
  onDeleteGroup: () => void;
}) {
  return (
    <>
      <Button
        type="button"
        variant="primary"
        size="md"
        className="h-[2.7rem] shrink-0 px-[1.125rem] text-xs"
        disabled={blocked || hasDraft}
        onClick={onAddExercise}
      >
        + New Exercicie
      </Button>

      <TrainingGroupOptionsMenu
        groupName={groupName}
        disabled={blocked}
        onRename={onRenameGroup}
        onDelete={onDeleteGroup}
      />
    </>
  );
}

export function TrainingGroupCard({
  data,
  actions,
  ui,
  bindHeaderRef,
  bindBodyRef,
  className,
}: TrainingGroupCardProps) {
  const savedExercises = data.exercises.filter((exercise) => exercise.status === 'saved');
  const isExpanded = Boolean(data.expanded);
  const blocked = ui?.disabled || ui?.saving;
  const expandedScrolls = Boolean(ui?.expandedScrolls);
  const durationLabel = formatGroupDurationLabel(data.timeMinutes);
  const durationClass = 'min-w-[5.75rem] shrink-0 text-sm font-semibold tabular-nums text-red';

  return (
    <div className={cn('flex min-h-0 flex-col', isExpanded && expandedScrolls && 'h-full', className)}>
      <Card
        className={cn(
          'flex px-6 lg:px-8',
          isExpanded
            ? expandedScrolls
              ? 'h-full min-h-0 flex-col overflow-hidden pt-5 pb-4 lg:pt-6 lg:pb-5'
              : 'shrink-0 flex-col pt-5 pb-4 lg:pt-6 lg:pb-5'
            : 'shrink-0 items-center py-4 lg:py-5',
        )}
      >
        {isExpanded ? (
          <>
            <div ref={bindHeaderRef} className="flex w-full min-w-0 items-center gap-3 lg:gap-4">
              <button
                type="button"
                aria-expanded={isExpanded}
                className="inline-flex max-w-[9rem] shrink-0 items-center gap-1 text-left text-base font-semibold text-text lg:max-w-[11rem]"
                onClick={actions.onToggleExpanded}
              >
                <span className="truncate">{data.name}</span>
                <MdExpandMore
                  className="h-5 w-5 shrink-0 rotate-180 text-text/70 transition-transform duration-200"
                  aria-hidden
                />
              </button>

              <span className={durationClass}>{durationLabel}</span>

              <div className="min-h-0 min-w-0 flex-1" aria-hidden />

              <GroupCardActions
                blocked={blocked}
                hasDraft={Boolean(data.draft)}
                groupName={data.name}
                onAddExercise={actions.onAddExercise}
                onRenameGroup={actions.onRenameGroup}
                onDeleteGroup={actions.onDeleteGroup}
              />
            </div>

            <div
              ref={bindBodyRef}
              className={cn(
                'mt-5 flex flex-col lg:mt-6',
                expandedScrolls && 'scrollbar-none overflow-y-auto',
              )}
              style={
                expandedScrolls && ui?.bodyMaxHeight
                  ? { maxHeight: ui.bodyMaxHeight }
                  : undefined
              }
            >
              {data.draft ? (
                <div className="mb-2.5 shrink-0">
                  <TrainingExerciseDraftRow
                    data={data.draft}
                    ui={{ disabled: blocked, saving: ui?.saving }}
                    actions={{
                      onChangeName: (value) => actions.onChangeDraftField('name', value),
                      onChangeEquipment: (value) => actions.onChangeDraftField('equipment', value),
                      onChangeWeight: (value) => actions.onChangeDraftField('weightKg', value),
                      onChangeSeries: (value) => actions.onChangeDraftField('series', value),
                      onChangeRepsMin: (value) => actions.onChangeDraftField('repsMin', value),
                      onChangeRepsMax: (value) => actions.onChangeDraftField('repsMax', value),
                      onConfirm: actions.onConfirmDraft,
                      onCancel: actions.onCancelDraft,
                    }}
                  />
                </div>
              ) : null}

              {savedExercises.length > 0 ? (
                <div className="flex shrink-0 flex-col gap-2.5 pr-1">
                  {savedExercises.map((exercise) => (
                    <TrainingExerciseRow
                      key={exercise.id}
                      data={exercise}
                      ui={{ disabled: blocked }}
                      actions={{
                        onSettings: () => actions.onEditExercise(exercise.id),
                      }}
                    />
                  ))}
                </div>
              ) : !data.draft ? (
                <p className="shrink-0 text-sm text-text/50">
                  No exercises yet. Use + New Exercicie to add one.
                </p>
              ) : null}
            </div>
          </>
        ) : (
          <div className="flex w-full min-w-0 items-center gap-3 lg:gap-4">
            <button
              type="button"
              aria-expanded={isExpanded}
              className="inline-flex max-w-[9rem] shrink-0 items-center gap-1 text-left text-base font-semibold text-text lg:max-w-[11rem]"
              onClick={actions.onToggleExpanded}
            >
              <span className="truncate">{data.name}</span>
              <MdExpandMore className="h-5 w-5 shrink-0 text-text/70" aria-hidden />
            </button>

            <span className={durationClass}>{durationLabel}</span>

            <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center px-1">
              <div className="w-full min-w-0 text-center">
                <TrainingGroupCollapsedExercisesLine exercises={savedExercises} />
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <GroupCardActions
                blocked={blocked}
                hasDraft={Boolean(data.draft)}
                groupName={data.name}
                onAddExercise={actions.onAddExercise}
                onRenameGroup={actions.onRenameGroup}
                onDeleteGroup={actions.onDeleteGroup}
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
