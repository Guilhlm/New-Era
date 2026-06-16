import { Injectable } from '@nestjs/common';
import { Prisma, TaskSourceType } from '@prisma/client';
import {
  assertResourceExists,
  assertResourceOwner,
} from '../../common/auth/ownership.util';
import { PrismaService } from '../../prisma/prisma.service';
import type {
  CreateTaskInput,
  CreateTasksBulkInput,
  UpdateTaskDto,
} from './dto/task.dto';

const DEFAULT_WORKOUT_TIME = '18:00';
const DEFAULT_MEAL_TIME = '12:00';

function compareScheduledAt(a: string, b: string) {
  return a.localeCompare(b);
}

function startOfTodayLocal() {
  const now = new Date();
  return calendarDateToDb(now.getFullYear(), now.getMonth(), now.getDate());
}

/** Maps a local calendar Y-M-D to a Prisma @db.Date value (UTC midnight of that date). */
function calendarDateToDb(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month, day));
}

function dbDateToCalendar(date: Date) {
  return calendarDateToDb(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function formatDateIso(date: Date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function shortWeekdayLabel(date: Date) {
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
  return labels[date.getDay()] ?? 'Sun';
}

function getCalendarWeekDates() {
  const todayLocal = new Date();
  const sunday = new Date(todayLocal);
  sunday.setDate(todayLocal.getDate() - todayLocal.getDay());
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(sunday);
    date.setDate(sunday.getDate() + index);
    return calendarDateToDb(date.getFullYear(), date.getMonth(), date.getDate());
  });
}

function getRollingDates(days: number) {
  const todayLocal = new Date();
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(todayLocal);
    date.setDate(todayLocal.getDate() - (days - 1 - index));
    return calendarDateToDb(date.getFullYear(), date.getMonth(), date.getDate());
  });
}

function aggregateDisciplineByWeekday(
  dailyEntries: Array<{
    date: string;
    label: string;
    weekday: number;
    percent: number;
    total: number;
    done: number;
  }>,
) {
  const buckets = Array.from({ length: 7 }, () => ({ sum: 0, count: 0 }));

  for (const entry of dailyEntries) {
    const weekday = entry.weekday;
    if (weekday < 0 || weekday > 6) continue;
    buckets[weekday].sum += entry.percent;
    buckets[weekday].count += 1;
  }

  const weekDates = getCalendarWeekDates();

  return weekDates.map((date, weekday) => {
    const bucket = buckets[weekday];
    const percent =
      bucket.count > 0 ? Math.round(bucket.sum / bucket.count) : 0;
    return disciplineDayEntry(date, 0, 0, percent);
  });
}

function disciplineDayEntry(
  date: Date,
  total: number,
  done: number,
  percentOverride?: number,
) {
  const percent =
    percentOverride !== undefined
      ? percentOverride
      : total > 0
        ? Math.round((done / total) * 100)
        : 0;
  const localRef = new Date(formatDateIso(date) + 'T12:00:00');
  return {
    date: formatDateIso(date),
    label: shortWeekdayLabel(localRef),
    weekday: localRef.getDay(),
    percent,
    total,
    done,
  };
}

function disciplineFromTasks(total: number, done: number) {
  if (total <= 0) {
    return { percent: 0, label: '0%', segments: { total: 0, filled: 0 } };
  }
  const percent = Math.round((done / total) * 100);
  return {
    percent,
    label: `${percent}%`,
    segments: { total, filled: done },
  };
}

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) {}

  async findByWeekday(userId: string, weekday: number) {
    const todayWeekday = new Date().getDay();
    const logDate = startOfTodayLocal();

    const tasks = await this.prisma.dailyTask.findMany({
      where: { userId, weekday, isActive: true },
      ...(weekday === todayWeekday
        ? {
            include: {
              completions: {
                where: { logDate },
                take: 1,
              },
            },
          }
        : {}),
      orderBy: [{ sortOrder: 'asc' }, { scheduledAt: 'asc' }],
    });

    return tasks.map((task) => {
      const completions =
        'completions' in task && Array.isArray(task.completions) ? task.completions : [];
      const { completions: _ignored, ...rest } = task as typeof task & {
        completions?: unknown[];
      };
      return {
        ...rest,
        done: weekday === todayWeekday ? completions.length > 0 : false,
      };
    });
  }

  async findWeekdaySummary(userId: string) {
    const grouped = await this.prisma.dailyTask.groupBy({
      by: ['weekday'],
      where: { userId, isActive: true },
      _count: { _all: true },
    });

    const counts = new Map(
      grouped.map((row) => [row.weekday, row._count._all]),
    );

    return Array.from({ length: 7 }, (_, weekday) => ({
      weekday,
      count: counts.get(weekday) ?? 0,
    }));
  }

  async findToday(userId: string) {
    return this.computeToday(this.prisma, userId);
  }

  private async computeToday(
    client: Prisma.TransactionClient | PrismaService,
    userId: string,
  ) {
    const weekday = new Date().getDay();
    const logDate = startOfTodayLocal();

    const tasks = await client.dailyTask.findMany({
      where: { userId, weekday, isActive: true },
      include: {
        completions: {
          where: { logDate },
          take: 1,
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { scheduledAt: 'asc' }],
    });

    const mapped = tasks.map((task) => ({
      ...task,
      done: task.completions.length > 0,
      completions: undefined,
    }));

    const done = mapped.filter((task) => task.done).length;
    const discipline = disciplineFromTasks(mapped.length, done);

    const dietTasks = mapped.filter(
      (task) => task.sourceType === TaskSourceType.DIET_MEAL,
    );
    const dietDone = dietTasks.filter((task) => task.done).length;
    const dietDiscipline = disciplineFromTasks(dietTasks.length, dietDone);

    return { weekday, tasks: mapped, discipline, dietDiscipline };
  }

  async findDisciplineHistory(
    userId: string,
    days: number,
    tab: 'training' | 'diet' | 'financial' = 'training',
  ) {
    const safeDays = [7, 14, 30].includes(days) ? days : 7;
    const dates =
      safeDays === 7 ? getCalendarWeekDates() : getRollingDates(safeDays);

    if (tab === 'financial') {
      const entries = dates.map((date) => disciplineDayEntry(date, 0, 0));
      return safeDays === 7 ? entries : aggregateDisciplineByWeekday(entries);
    }

    const taskWhere =
      tab === 'diet'
        ? { userId, isActive: true, sourceType: TaskSourceType.DIET_MEAL }
        : { userId, isActive: true };

    const tasks = await this.prisma.dailyTask.findMany({
      where: taskWhere,
      select: { id: true, weekday: true },
    });

    const taskIdsByWeekday = new Map<number, string[]>();
    for (const task of tasks) {
      const bucket = taskIdsByWeekday.get(task.weekday) ?? [];
      bucket.push(task.id);
      taskIdsByWeekday.set(task.weekday, bucket);
    }

    const taskIds = tasks.map((task) => task.id);

    const rangeStart = dates[0];
    const rangeEnd = dates[dates.length - 1];

    const completions =
      taskIds.length === 0
        ? []
        : await this.prisma.taskCompletion.findMany({
            where: {
              taskId: { in: taskIds },
              logDate: { gte: rangeStart, lte: rangeEnd },
            },
            select: { taskId: true, logDate: true },
          });

    const doneByDate = new Map<string, Set<string>>();
    for (const completion of completions) {
      const key = formatDateIso(dbDateToCalendar(completion.logDate));
      const bucket = doneByDate.get(key) ?? new Set<string>();
      bucket.add(completion.taskId);
      doneByDate.set(key, bucket);
    }

    const dailyEntries = dates.map((date) => {
      const localRef = new Date(formatDateIso(date) + 'T12:00:00');
      const weekday = localRef.getDay();
      const taskIds = taskIdsByWeekday.get(weekday) ?? [];
      const total = taskIds.length;
      const doneSet = doneByDate.get(formatDateIso(date)) ?? new Set<string>();
      const done = taskIds.filter((id) => doneSet.has(id)).length;
      return disciplineDayEntry(date, total, done);
    });

    return safeDays === 7
      ? dailyEntries
      : aggregateDisciplineByWeekday(dailyEntries);
  }

  async findSuggestions(userId: string, weekday: number) {
    const existing = await this.prisma.dailyTask.findMany({
      where: { userId, weekday, isActive: true, sourceId: { not: null } },
      select: { sourceType: true, sourceId: true },
    });

    const linkedKeys = new Set(
      existing.map((task) => `${task.sourceType}:${task.sourceId}`),
    );

    const suggestions: Array<{
      sourceType: TaskSourceType;
      sourceId: string;
      title: string;
      defaultScheduledAt: string;
    }> = [];

    const workout = await this.prisma.workoutDayPlan.findUnique({
      where: { userId_weekday: { userId, weekday } },
      include: {
        groups: { where: { isActive: true }, take: 1 },
      },
    });

    if (workout?.isActive && workout.groups.length > 0) {
      const key = `${TaskSourceType.WORKOUT}:${workout.id}`;
      if (!linkedKeys.has(key)) {
        suggestions.push({
          sourceType: TaskSourceType.WORKOUT,
          sourceId: workout.id,
          title: `Treinar: ${workout.title}`,
          defaultScheduledAt: DEFAULT_WORKOUT_TIME,
        });
      }
    }

    const meals = await this.prisma.dietMeal.findMany({
      where: { userId, weekday, isActive: true },
      orderBy: { createdAt: 'asc' },
    });

    for (const meal of meals) {
      const key = `${TaskSourceType.DIET_MEAL}:${meal.id}`;
      if (linkedKeys.has(key)) continue;
      suggestions.push({
        sourceType: TaskSourceType.DIET_MEAL,
        sourceId: meal.id,
        title: `Refeição: ${meal.name}`,
        defaultScheduledAt: meal.mealTime ?? DEFAULT_MEAL_TIME,
      });
    }

    return suggestions;
  }

  async create(data: CreateTaskInput) {
    return this.prisma.$transaction(async (tx) => {
      const task = await tx.dailyTask.create({
        data: {
          userId: data.userId,
          weekday: data.weekday,
          title: data.title,
          scheduledAt: data.scheduledAt,
          sourceType: data.sourceType ?? TaskSourceType.MANUAL,
          sourceId: data.sourceId ?? null,
        },
      });

      await this.recalculateSortOrder(tx, data.userId, data.weekday);
      return tx.dailyTask.findUniqueOrThrow({ where: { id: task.id } });
    });
  }

  async createBulk(data: CreateTasksBulkInput) {
    return this.prisma.$transaction(async (tx) => {
      for (const item of data.tasks) {
        await tx.dailyTask.create({
          data: {
            userId: data.userId,
            weekday: data.weekday,
            title: item.title,
            scheduledAt: item.scheduledAt,
            sourceType: item.sourceType,
            sourceId: item.sourceId,
          },
        });
      }

      await this.recalculateSortOrder(tx, data.userId, data.weekday);
      return tx.dailyTask.findMany({
        where: { userId: data.userId, weekday: data.weekday, isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { scheduledAt: 'asc' }],
      });
    });
  }

  async update(userId: string, taskId: string, data: UpdateTaskDto) {
    const task = await this.assertTaskOwner(userId, taskId);

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.dailyTask.update({
        where: { id: taskId },
        data: {
          ...(data.title !== undefined ? { title: data.title } : {}),
          ...(data.scheduledAt !== undefined
            ? { scheduledAt: data.scheduledAt }
            : {}),
          ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        },
      });

      if (data.scheduledAt !== undefined) {
        await this.recalculateSortOrder(tx, userId, task.weekday);
        return tx.dailyTask.findUniqueOrThrow({ where: { id: taskId } });
      }

      return updated;
    });
  }

  async remove(userId: string, taskId: string) {
    await this.assertTaskOwner(userId, taskId);
    return this.prisma.dailyTask.delete({ where: { id: taskId } });
  }

  async toggleComplete(userId: string, taskId: string) {
    const task = await this.assertTaskOwner(userId, taskId);
    const logDate = startOfTodayLocal();

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.taskCompletion.findUnique({
        where: { taskId_logDate: { taskId, logDate } },
      });

      if (existing) {
        await tx.taskCompletion.delete({ where: { id: existing.id } });
      } else {
        await tx.taskCompletion.create({
          data: { taskId, logDate },
        });
      }

      const today = await this.computeToday(tx, userId);
      const updatedTask = today.tasks.find((item) => item.id === taskId);

      await tx.user.update({
        where: { id: userId },
        data: { disciplineLevel: today.discipline.percent },
      });

      return {
        task: updatedTask ?? { ...task, done: !existing },
        discipline: today.discipline,
        dietDiscipline: today.dietDiscipline,
      };
    });
  }

  private async recalculateSortOrder(
    tx: Prisma.TransactionClient,
    userId: string,
    weekday: number,
  ) {
    const tasks = await tx.dailyTask.findMany({
      where: { userId, weekday, isActive: true },
      orderBy: { scheduledAt: 'asc' },
    });

    const sorted = [...tasks].sort((a, b) =>
      compareScheduledAt(a.scheduledAt, b.scheduledAt),
    );

    for (const [index, task] of sorted.entries()) {
      if (task.sortOrder === index) continue;
      await tx.dailyTask.update({
        where: { id: task.id },
        data: { sortOrder: index },
      });
    }
  }

  private async assertTaskOwner(userId: string, taskId: string) {
    const task = await this.prisma.dailyTask.findUnique({
      where: { id: taskId },
    });
    const existing = assertResourceExists(task, 'Task');
    assertResourceOwner(existing.userId, userId, 'Task');
    return existing;
  }
}
