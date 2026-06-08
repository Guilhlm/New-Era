import type {
  TrainingDayPlanVm,
  TrainingExerciseVm,
  TrainingMuscleGroupVm,
  TrainingPlanSummaryVm,
} from '@/types/training';

export type TrainingExerciseRecord = {
  id: string;
  groupId: string;
  name: string;
  equipment?: string | null;
  weightKg?: string | number | null;
  series?: number | null;
  repsMin?: number | null;
  repsMax?: number | null;
  imageUrl?: string | null;
  isCompleted?: boolean;
  sortOrder?: number;
};

export type TrainingMuscleGroupRecord = {
  id: string;
  dayPlanId: string;
  name: string;
  timeMinutes?: number | null;
  sortOrder?: number;
  isActive?: boolean;
  exercises?: TrainingExerciseRecord[];
};

export type TrainingDayPlanRecord = {
  id: string;
  userId: string;
  weekday: number;
  title: string;
  notes?: string | null;
  isActive?: boolean;
  groups?: TrainingMuscleGroupRecord[];
};

export type TrainingPlanSummaryRecord = {
  weekday: number;
  title: string;
  notes?: string | null;
  isActive?: boolean;
};

export const REST_DAY_LABEL = 'Rest Day';

export function resolveSheetTitle(title: string) {
  return title.trim() !== REST_DAY_LABEL ? title.trim() : null;
}

export function resolvePlanDisplayTitle(title: string, isActive = true) {
  if (!isActive) return REST_DAY_LABEL;
  return title.trim() || REST_DAY_LABEL;
}

function toNumber(value: string | number | null | undefined) {
  if (value === null || value === undefined) return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function mapExerciseToVm(exercise: TrainingExerciseRecord): TrainingExerciseVm {
  return {
    id: exercise.id,
    groupId: exercise.groupId,
    status: 'saved',
    name: exercise.name,
    equipment: exercise.equipment ?? null,
    weightKg: toNumber(exercise.weightKg),
    series: exercise.series ?? null,
    repsMin: exercise.repsMin ?? null,
    repsMax: exercise.repsMax ?? null,
    imageUrl: exercise.imageUrl ?? null,
    isCompleted: exercise.isCompleted ?? false,
  };
}

export function mapGroupToVm(group: TrainingMuscleGroupRecord): TrainingMuscleGroupVm {
  return {
    id: group.id,
    name: group.name,
    timeMinutes: group.timeMinutes ?? null,
    expanded: false,
    exercises: (group.exercises ?? []).map(mapExerciseToVm),
    draft: null,
  };
}

export function mapDayPlanToVm(
  plan: TrainingDayPlanRecord | null,
  weekday: number,
): TrainingDayPlanVm {
  if (!plan) {
    return {
      id: null,
      weekday,
      title: REST_DAY_LABEL,
      sheetTitle: null,
      isActive: false,
      notes: null,
      groups: [],
    };
  }

  const isActive = plan.isActive ?? true;
  const sheetTitle = resolveSheetTitle(plan.title);

  return {
    id: plan.id,
    weekday: plan.weekday,
    title: resolvePlanDisplayTitle(plan.title, isActive),
    sheetTitle,
    isActive,
    notes: plan.notes ?? null,
    groups: isActive ? (plan.groups ?? []).map(mapGroupToVm) : [],
  };
}

export function mapPlanSummaryToVm(record: TrainingPlanSummaryRecord): TrainingPlanSummaryVm {
  const isActive = record.isActive ?? true;
  const sheetTitle = resolveSheetTitle(record.title);

  return {
    weekday: record.weekday,
    title: record.title,
    displayTitle: resolvePlanDisplayTitle(record.title, isActive),
    sheetTitle,
    isActive,
    notes: record.notes ?? null,
  };
}

export function formatExerciseDisplayName(name: string, equipment: string | null) {
  return equipment ? `${name} | ${equipment}` : name;
}

export function formatWeightLabel(weightKg: number | null) {
  if (weightKg === null) return '—';
  return `${weightKg % 1 === 0 ? weightKg.toFixed(0) : weightKg.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}kg`;
}

export function formatSeriesLabel(series: number | null) {
  if (series === null) return '—';
  return `${series} Series`;
}

export function formatRepsLabel(repsMin: number | null, repsMax: number | null) {
  if (repsMin === null && repsMax === null) return '—';
  if (repsMin !== null && repsMax !== null && repsMin !== repsMax) {
    return `${repsMin}-${repsMax} Reps`;
  }
  const value = repsMin ?? repsMax;
  return value !== null ? `${value} Reps` : '—';
}

export function formatGroupDurationLabel(timeMinutes: number | null) {
  if (timeMinutes === null) return '—';
  return `${timeMinutes} Minutes`;
}
