'use client';

import { CollapsedItemsPreview } from '@/components/ui/collapsed-items-preview';
import type { TrainingExerciseVm } from '@/types/training';
import { formatExerciseDisplayName } from '@/utils/training-mapper';

type TrainingGroupCollapsedExercisesLineProps = {
  exercises: TrainingExerciseVm[];
};

export function TrainingGroupCollapsedExercisesLine({
  exercises,
}: TrainingGroupCollapsedExercisesLineProps) {
  const previewNames = exercises.map((exercise) =>
    formatExerciseDisplayName(exercise.name, exercise.equipment),
  );

  return (
    <CollapsedItemsPreview
      count={exercises.length}
      countLabel={`${exercises.length} ${exercises.length === 1 ? 'ex' : 'exs'}`}
      emptyLabel="Sem exercícios — toque para expandir"
      previewNames={previewNames}
      fullTitle={previewNames.join(' · ')}
    />
  );
}
