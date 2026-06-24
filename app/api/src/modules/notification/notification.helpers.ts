import {
  NotificationCategory,
  NotificationKind,
  NotificationPeriod,
  NotificationPriority,
  Prisma,
} from '@prisma/client';

/**
 * Shape produced by a notification rule before persistence. The generator
 * service upserts each draft using `dedupeKey`, so recurring drafts can update
 * their content over time without creating duplicates.
 */
export type NotificationDraft = {
  dedupeKey: string;
  period: NotificationPeriod;
  category: NotificationCategory;
  kind: NotificationKind;
  priority?: NotificationPriority;
  title: string;
  body: string;
  href?: string;
  ctaLabel?: string;
  metadata?: Prisma.InputJsonObject;
  expiresAt?: Date;
};

export function todayUtc(now = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

export function toIsoDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

export function startOfWeekUtc(now = new Date()) {
  const date = todayUtc(now);
  const weekday = date.getUTCDay();
  const diff = weekday === 0 ? 6 : weekday - 1;
  date.setUTCDate(date.getUTCDate() - diff);
  return date;
}

export function startOfMonthUtc(now = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

/** ISO weekday where Monday = 1 ... Sunday = 7, matching the DailyTask model. */
export function isoWeekday(now = new Date()) {
  const day = now.getUTCDay();
  return day === 0 ? 7 : day;
}

export function monthKey(date = new Date()) {
  return toIsoDate(startOfMonthUtc(date)).slice(0, 7);
}

export function round(value: number, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/** Weekday 0=Sun … 6=Sat — matches DailyTask.weekday in the task module. */
export function localWeekday(now = new Date()) {
  return now.getDay();
}

export function formatLocalHHmm(now = new Date()) {
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function addMinutesLocal(now: Date, minutes: number) {
  return new Date(now.getTime() + minutes * 60_000);
}

export function localDayKey(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function startOfTodayLocal(now = new Date()) {
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

export function endOfTodayLocal(now = new Date()) {
  const start = startOfTodayLocal(now);
  return new Date(start.getTime() + 24 * 60 * 60 * 1000);
}

/** Largest "round" milestone (1k, 5k, 10k, 50k...) crossed by a value. */
export function patrimonyMilestone(value: number) {
  if (value <= 0) return 0;
  const steps = [
    1_000, 5_000, 10_000, 25_000, 50_000, 100_000, 250_000, 500_000, 1_000_000,
  ];
  let reached = 0;
  for (const step of steps) {
    if (value >= step) reached = step;
  }
  return reached;
}
