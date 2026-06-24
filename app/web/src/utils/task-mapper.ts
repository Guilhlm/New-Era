import type { TaskSourceType } from '@/types/task';

export type DailyTaskRecord = {
  id: string;
  userId: string;
  weekday: number;
  title: string;
  scheduledAt: string;
  sortOrder: number;
  isActive: boolean;
  sourceType: TaskSourceType;
  sourceId: string | null;
  done?: boolean;
};

export type TaskSuggestionRecord = {
  sourceType: TaskSourceType;
  sourceId: string;
  title: string;
  defaultScheduledAt: string;
};

export type TaskDisciplineRecord = {
  percent: number;
  label: string;
  segments: {
    total: number;
    filled: number;
  };
};

export type TaskDisciplineDayRecord = {
  date: string;
  label: string;
  weekday?: number;
  percent: number;
  total: number;
  done: number;
};

const ORDINAL_SUFFIXES = ['º', 'º', 'º', 'º', 'º', 'º', 'º', 'º', 'º', 'º'];

function ordinalRank(index: number) {
  return `${index + 1}${ORDINAL_SUFFIXES[index] ?? 'º'}`;
}

export function mapTaskToVm(record: DailyTaskRecord, rankIndex?: number) {
  return {
    id: record.id,
    weekday: record.weekday,
    title: record.title,
    scheduledAt: record.scheduledAt,
    sortOrder: record.sortOrder,
    sourceType: record.sourceType,
    sourceId: record.sourceId,
    done: record.done,
    rank: rankIndex !== undefined ? ordinalRank(rankIndex) : undefined,
  };
}

export function mapTasksToVm(records: DailyTaskRecord[]) {
  return records.map((record, index) => mapTaskToVm(record, index));
}

export function mapTasksToHomeVm(records: DailyTaskRecord[]) {
  return records.map((record, index) => ({
    id: record.id,
    rank: ordinalRank(index),
    title: record.title,
    done: record.done ?? false,
    sourceType: record.sourceType,
  }));
}

/** Ensures a value is valid for `<input type="time">` (HH:mm). */
export function normalizeTimeInputValue(value: string | null | undefined, fallback = '09:00') {
  if (!value?.trim()) return fallback;
  const match = value.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return fallback;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return fallback;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function mapSuggestionToVm(record: TaskSuggestionRecord) {
  const defaultScheduledAt = normalizeTimeInputValue(record.defaultScheduledAt);
  return {
    sourceType: record.sourceType,
    sourceId: record.sourceId,
    title: record.title,
    defaultScheduledAt,
    selected: false,
    scheduledAt: defaultScheduledAt,
  };
}

export function mapDisciplineHistoryToVm(records: TaskDisciplineDayRecord[]) {
  return records.map((record) => ({
    date: record.date,
    label: record.label,
    weekday: record.weekday,
    percent: record.percent,
    total: record.total,
    done: record.done,
    heightPercent: record.percent,
  }));
}

export function todayDateIso() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function applyTodayDisciplinePatch(
  days: TaskDisciplineDayRecord[],
  patch: { percent: number; done: number; total: number },
) {
  if (days.length === 0) return days;
  const today = todayDateIso();
  const todayWeekday = new Date().getDay();
  let targetIdx = days.findIndex((day) => day.date === today);
  if (targetIdx < 0) {
    targetIdx = days.findIndex((day) => day.weekday === todayWeekday);
  }
  if (targetIdx < 0) targetIdx = days.length - 1;
  return days.map((day, index) =>
    index === targetIdx ? { ...day, percent: patch.percent, done: patch.done, total: patch.total } : day,
  );
}

export function averageDisciplinePercent(days: Array<{ percent: number }>) {
  if (days.length === 0) return 0;
  const sum = days.reduce((total, day) => total + day.percent, 0);
  return Math.round(sum / days.length);
}

export function disciplineLabelFromPercent(percent: number) {
  return `${percent}%`;
}

function dietDisciplineFromTasks(
  tasks: Array<{ sourceType: TaskSourceType; done?: boolean }>,
) {
  const dietTasks = tasks.filter((task) => task.sourceType === 'DIET_MEAL');
  const done = dietTasks.filter((task) => task.done).length;
  const total = dietTasks.length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  return {
    percent,
    label: `${percent}%`,
    segments: { total, filled: done },
  };
}

export function computeDietDisciplineAfterToggle(
  tasks: Array<{ id: string; sourceType: TaskSourceType; done?: boolean }>,
  taskId: string,
  wasDone: boolean,
) {
  const nextTasks = tasks.map((task) =>
    task.id === taskId ? { ...task, done: !wasDone } : task,
  );
  return dietDisciplineFromTasks(nextTasks);
}

export function sourceTypeLabel(sourceType: TaskSourceType) {
  switch (sourceType) {
    case 'WORKOUT':
      return 'Workout';
    case 'DIET_MEAL':
      return 'Diet';
    default:
      return 'Manual';
  }
}
