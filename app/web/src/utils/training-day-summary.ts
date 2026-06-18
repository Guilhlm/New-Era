import type { TrainingDaySummaryVm, TrainingMuscleGroupVm } from '@/types/training';
import { clampPercent } from '@/utils/number-draft';

export type { TrainingDaySummaryStatVm, TrainingDaySummaryVm } from '@/types/training';

function formatVolumeKg(total: number) {
  if (total >= 1000) {
    return `${(total / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 })}k`;
  }
  return total.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

export function buildTrainingDaySummary(
  groups: TrainingMuscleGroupVm[],
  isActive: boolean,
): TrainingDaySummaryVm {
  if (!isActive) {
    return {
      stats: [
        {
          key: 'exercises',
          label: 'Exercises',
          valueLabel: '—',
          subLabel: 'Rest day — no workout',
          percent: 0,
          barClassName: 'bg-layer2',
        },
        {
          key: 'duration',
          label: 'Duration',
          valueLabel: '—',
          subLabel: 'Take time to recover',
          percent: 0,
          barClassName: 'bg-layer2',
        },
        {
          key: 'volume',
          label: 'Volume',
          valueLabel: '—',
          subLabel: 'Back stronger tomorrow',
          percent: 0,
          barClassName: 'bg-layer2',
        },
      ],
    };
  }

  const exercises = groups.flatMap((group) =>
    group.exercises.filter((exercise) => exercise.status === 'saved'),
  );
  const completed = exercises.filter((exercise) => exercise.isCompleted).length;
  const total = exercises.length;
  const completionPercent = total > 0 ? (completed / total) * 100 : 0;

  const durationMinutes = groups.reduce((sum, group) => sum + (group.timeMinutes ?? 0), 0);
  const volumeKg = exercises.reduce(
    (sum, exercise) => sum + (exercise.weightKg ?? 0) * (exercise.series ?? 0),
    0,
  );

  return {
    stats: [
      {
        key: 'exercises',
        label: 'Exercises',
        valueLabel: total > 0 ? `${completed}/${total}` : '0',
        subLabel:
          total === 0
            ? 'No exercises yet'
            : completed === total
              ? 'All exercises done'
              : `${total - completed} remaining`,
        percent: clampPercent(completionPercent),
        barClassName: 'bg-red',
      },
      {
        key: 'duration',
        label: 'Duration',
        valueLabel: durationMinutes > 0 ? `${durationMinutes} min` : '0 min',
        subLabel:
          groups.length > 0
            ? `${groups.length} muscle group${groups.length === 1 ? '' : 's'} planned`
            : 'Add groups below',
        percent: clampPercent((durationMinutes / 90) * 100),
        barClassName: 'bg-red/80',
      },
      {
        key: 'volume',
        label: 'Volume',
        valueLabel: volumeKg > 0 ? `${formatVolumeKg(volumeKg)} kg` : '0 kg',
        subLabel: volumeKg > 0 ? 'Total sets × load' : 'Add weights to track',
        percent: clampPercent((volumeKg / 4000) * 100),
        barClassName: 'bg-red/60',
      },
    ],
  };
}
