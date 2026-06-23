import type { TrainingDayPlanVm, TrainingExerciseVm, TrainingMuscleGroupVm, TrainingPlanSummaryVm } from '@/types/training';
import type {
  CopyTrainingDayInput,
  CreateTrainingExerciseInput,
  CreateTrainingGroupInput,
  UpdateTrainingDayInput,
  UpdateTrainingExerciseInput,
} from '@/types/training';
import { deleteJson, getJson, patchJson, postJson } from '@/services/http';

export function getWorkoutDay(weekday: number) {
  return getJson<{ plan: TrainingDayPlanVm }>(`/api/workout/day?weekday=${weekday}`, {
    cache: 'no-store',
    credentials: 'include',
  });
}

export function getWorkoutPlanSummary() {
  return getJson<{ days: TrainingPlanSummaryVm[] }>('/api/workout/plan', {
    cache: 'no-store',
    credentials: 'include',
  });
}

export function updateWorkoutDay(weekday: number, input: UpdateTrainingDayInput) {
  return patchJson<{ plan: TrainingDayPlanVm }, UpdateTrainingDayInput>(
    `/api/workout/day/${weekday}`,
    input,
    { cache: 'no-store', credentials: 'include' },
  );
}

export function createWorkoutGroup(input: CreateTrainingGroupInput) {
  return postJson<{ group: TrainingMuscleGroupVm }, CreateTrainingGroupInput>(
    '/api/workout/groups',
    input,
    { cache: 'no-store', credentials: 'include' },
  );
}

export function updateWorkoutGroup(groupId: string, input: { name?: string; timeMinutes?: number | null }) {
  return patchJson<{ group: TrainingMuscleGroupVm }, { name?: string; timeMinutes?: number | null }>(
    `/api/workout/groups/${groupId}`,
    input,
    { cache: 'no-store', credentials: 'include' },
  );
}

export function deleteWorkoutGroup(groupId: string) {
  return deleteJson<{ ok: true }>(`/api/workout/groups/${groupId}`, {
    cache: 'no-store',
    credentials: 'include',
  });
}

export function createWorkoutExercise(groupId: string, input: CreateTrainingExerciseInput) {
  return postJson<{ exercise: TrainingExerciseVm }, CreateTrainingExerciseInput>(
    `/api/workout/groups/${groupId}/exercises`,
    input,
    { cache: 'no-store', credentials: 'include' },
  );
}

export function updateWorkoutExercise(
  groupId: string,
  exerciseId: string,
  input: UpdateTrainingExerciseInput,
) {
  return patchJson<{ exercise: TrainingExerciseVm }, UpdateTrainingExerciseInput>(
    `/api/workout/groups/${groupId}/exercises/${exerciseId}`,
    input,
    { cache: 'no-store', credentials: 'include' },
  );
}

export function deleteWorkoutExercise(groupId: string, exerciseId: string) {
  return deleteJson<{ ok: true }>(`/api/workout/groups/${groupId}/exercises/${exerciseId}`, {
    cache: 'no-store',
    credentials: 'include',
  });
}

export function reorderWorkoutExercises(groupId: string, exerciseIds: string[]) {
  return patchJson<{ exercises: TrainingExerciseVm[] }, { exerciseIds: string[] }>(
    `/api/workout/groups/${groupId}/exercises/reorder`,
    { exerciseIds },
    { cache: 'no-store', credentials: 'include' },
  );
}

export function copyWorkoutDay(input: CopyTrainingDayInput) {
  return postJson<{ plan: TrainingDayPlanVm }, CopyTrainingDayInput>(
    '/api/workout/day/copy',
    input,
    { cache: 'no-store', credentials: 'include' },
  );
}
