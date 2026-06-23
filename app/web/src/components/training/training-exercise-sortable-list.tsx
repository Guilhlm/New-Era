'use client';

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TrainingExerciseRow } from '@/components/training/training-exercise-row';
import type { TrainingExerciseVm } from '@/types/training';

type TrainingExerciseSortableListProps = {
  groupId: string;
  exercises: TrainingExerciseVm[];
  disabled?: boolean;
  onEditExercise: (exerciseId: string) => void;
  onReorder: (groupId: string, exerciseIds: string[]) => void;
};

type SortableExerciseRowProps = {
  exercise: TrainingExerciseVm;
  disabled?: boolean;
  onSettings: () => void;
};

function SortableExerciseRow({ exercise, disabled, onSettings }: SortableExerciseRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: exercise.id,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? 'relative opacity-70' : undefined}
    >
      <TrainingExerciseRow
        data={exercise}
        ui={{ disabled }}
        actions={{ onSettings }}
        dragHandle={{
          attributes,
          listeners,
        }}
      />
    </div>
  );
}

export function TrainingExerciseSortableList({
  groupId,
  exercises,
  disabled,
  onEditExercise,
  onReorder,
}: TrainingExerciseSortableListProps) {
  const exerciseIds = exercises.map((exercise) => exercise.id);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = exerciseIds.indexOf(String(active.id));
    const newIndex = exerciseIds.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;

    onReorder(groupId, arrayMove(exerciseIds, oldIndex, newIndex));
  }

  if (exercises.length === 0) return null;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={exerciseIds} strategy={verticalListSortingStrategy}>
        <div className="flex shrink-0 flex-col gap-2.5 pr-1">
          {exercises.map((exercise) => (
            <SortableExerciseRow
              key={exercise.id}
              exercise={exercise}
              disabled={disabled}
              onSettings={() => onEditExercise(exercise.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
