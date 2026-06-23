export type TrainingExerciseVm = {
  id: string;
  groupId?: string;
  status: 'draft' | 'saved';
  name: string;
  equipment: string | null;
  weightKg: number | null;
  series: number | null;
  repsMin: number | null;
  repsMax: number | null;
  imageUrl: string | null;
  isCompleted: boolean;
};

export type TrainingExerciseDraftVm = TrainingExerciseVm & {
  status: 'draft';
  draftKey: string;
};

export type TrainingMuscleGroupVm = {
  id: string;
  name: string;
  timeMinutes: number | null;
  weekday?: number | null;
  exercises: TrainingExerciseVm[];
  expanded?: boolean;
  draft?: TrainingExerciseDraftVm | null;
};

export type TrainingDayPlanVm = {
  id: string | null;
  weekday: number;
  title: string;
  sheetTitle: string | null;
  isActive: boolean;
  notes: string | null;
  groups: TrainingMuscleGroupVm[];
};

export type TrainingPlanSummaryVm = {
  weekday: number;
  title: string;
  displayTitle: string;
  sheetTitle: string | null;
  isActive: boolean;
  notes: string | null;
};

export type CreateTrainingGroupInput = {
  weekday: number;
  name: string;
  timeMinutes?: number | null;
};

export type CreateTrainingExerciseInput = {
  name: string;
  equipment?: string | null;
  weightKg?: number | null;
  series?: number | null;
  repsMin?: number | null;
  repsMax?: number | null;
  imageUrl?: string | null;
};

export type UpdateTrainingExerciseInput = {
  name?: string;
  equipment?: string | null;
  weightKg?: number | null;
  series?: number | null;
  repsMin?: number | null;
  repsMax?: number | null;
  imageUrl?: string | null;
  isCompleted?: boolean;
};

export type UpdateTrainingDayInput = {
  title?: string;
  notes?: string | null;
  isActive?: boolean;
};

export type CopyTrainingDayInput = {
  sourceWeekday: number;
  targetWeekday: number;
};

export type TrainingDaySummaryStatVm = {
  key: 'exercises' | 'duration' | 'volume';
  label: string;
  valueLabel: string;
  subLabel: string;
  percent: number;
  barClassName: string;
};

export type TrainingDaySummaryVm = {
  stats: TrainingDaySummaryStatVm[];
};
