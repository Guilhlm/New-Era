export type UpdateWorkoutDayPlanDto = {
  title?: string;
  notes?: string | null;
  isActive?: boolean;
};

export type CreateWorkoutMuscleGroupDto = {
  weekday: number;
  name: string;
  timeMinutes?: number | null;
};

export type UpdateWorkoutMuscleGroupDto = {
  name?: string;
  timeMinutes?: number | null;
  isActive?: boolean;
};

export type CreateWorkoutExerciseDto = {
  name: string;
  equipment?: string | null;
  weightKg?: number | null;
  series?: number | null;
  repsMin?: number | null;
  repsMax?: number | null;
  imageUrl?: string | null;
};

export type UpdateWorkoutExerciseDto = {
  name?: string;
  equipment?: string | null;
  weightKg?: number | null;
  series?: number | null;
  repsMin?: number | null;
  repsMax?: number | null;
  imageUrl?: string | null;
  isCompleted?: boolean;
};
