'use client';

import { forwardRef } from 'react';
import type { TrainingExerciseVm, TrainingMuscleGroupVm } from '@/types/training';
import {
  formatExerciseDisplayName,
  formatGroupDurationLabel,
  formatRepsLabel,
  formatSeriesLabel,
  formatWeightLabel,
} from '@/utils/training-mapper';
import { TRAINING_EXPORT_COLORS as colors } from '@/utils/export-image';

type TrainingExportSheetProps = {
  weekdayLabel: string;
  planTitle: string;
  groups: TrainingMuscleGroupVm[];
};

function ExportExerciseRow({ exercise }: { exercise: TrainingExerciseVm }) {
  const stats = `${formatWeightLabel(exercise.weightKg)} · ${formatSeriesLabel(exercise.series)} · ${formatRepsLabel(exercise.repsMin, exercise.repsMax)}`;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        borderRadius: 12,
        backgroundColor: colors.layer2Half,
        padding: '12px 16px',
      }}
    >
      <div
        style={{
          display: 'flex',
          height: 56,
          width: 80,
          flexShrink: 0,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 6,
          backgroundColor: colors.layer2,
          color: colors.textMuted,
          fontSize: 12,
        }}
      >
        EX
      </div>

      <div style={{ minWidth: 0, flex: 1 }}>
        <p
          style={{
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: exercise.isCompleted ? colors.textMuted : colors.text,
            fontSize: 14,
            fontWeight: 600,
            textDecoration: exercise.isCompleted ? 'line-through' : 'none',
          }}
        >
          {formatExerciseDisplayName(exercise.name, exercise.equipment)}
        </p>
        <p
          style={{
            margin: '6px 0 0',
            color: colors.textMuted,
            fontSize: 12,
            lineHeight: '16px',
          }}
        >
          {stats}
        </p>
      </div>
    </div>
  );
}

export const TrainingExportSheet = forwardRef<HTMLDivElement, TrainingExportSheetProps>(
  function TrainingExportSheet({ weekdayLabel, planTitle, groups }, ref) {
    return (
      <div
        ref={ref}
        aria-hidden
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: 390,
          boxSizing: 'border-box',
          padding: 16,
          backgroundColor: colors.background,
          color: colors.text,
          fontFamily: 'var(--font-geist-sans, Arial, sans-serif)',
          opacity: 0,
          pointerEvents: 'none',
          visibility: 'hidden',
        }}
      >
        <div
          style={{
            marginBottom: 16,
            borderRadius: 12,
            backgroundColor: colors.layer1,
            padding: '16px 20px',
            boxShadow: 'inset 0 0 0 1px rgba(211, 210, 209, 0.15)',
          }}
        >
          <p
            style={{
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: colors.accent,
              fontSize: 18,
              fontWeight: 600,
              lineHeight: '24px',
            }}
          >
            {weekdayLabel} · {planTitle}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {groups.map((group) => {
            const savedExercises = group.exercises.filter((exercise) => exercise.status === 'saved');

            return (
              <div
                key={group.id}
                style={{
                  borderRadius: 12,
                  backgroundColor: colors.layer1,
                  padding: '20px',
                  boxShadow: 'inset 0 0 0 1px rgba(211, 210, 209, 0.15)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    width: '100%',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <span
                    style={{
                      minWidth: 0,
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: colors.text,
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    {group.name}
                  </span>
                  <span
                    style={{
                      flexShrink: 0,
                      color: colors.accent,
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    {formatGroupDurationLabel(group.timeMinutes)}
                  </span>
                </div>

                <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {savedExercises.length > 0 ? (
                    savedExercises.map((exercise) => (
                      <ExportExerciseRow key={exercise.id} exercise={exercise} />
                    ))
                  ) : (
                    <p style={{ margin: 0, color: colors.textMuted, fontSize: 14 }}>
                      No exercises yet.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);
