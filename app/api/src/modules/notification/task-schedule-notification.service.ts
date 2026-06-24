import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  NotificationCategory,
  NotificationKind,
  NotificationPeriod,
  NotificationPriority,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  addMinutesLocal,
  endOfTodayLocal,
  formatLocalHHmm,
  localDayKey,
  localWeekday,
  startOfTodayLocal,
} from './notification.helpers';
import { NotificationService } from './notification.service';

const TASK_TICK_MS = 30_000;
const TASK_BOOTSTRAP_MS = 3_000;

@Injectable()
export class TaskScheduleNotificationService implements OnModuleInit {
  private readonly logger = new Logger(TaskScheduleNotificationService.name);
  private ticking = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationService,
  ) {}

  onModuleInit() {
    this.logger.log(`Task schedule notifier enabled (every ${TASK_TICK_MS / 1000}s).`);
    setTimeout(() => {
      void this.tick('bootstrap');
    }, TASK_BOOTSTRAP_MS);
    setInterval(() => {
      void this.tick('interval');
    }, TASK_TICK_MS);
  }

  async processAllUsers() {
    const users = await this.prisma.user.findMany({ select: { id: true } });
    for (const user of users) {
      await this.processUser(user.id);
    }
  }

  private async tick(reason: 'bootstrap' | 'interval') {
    if (this.ticking) {
      return;
    }

    this.ticking = true;
    try {
      await this.processAllUsers();
      this.logger.debug(`Task schedule notifier finished (${reason}).`);
    } catch (error) {
      this.logger.warn(
        `Task schedule notifier failed (${reason}): ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );
    } finally {
      this.ticking = false;
    }
  }

  private async processUser(userId: string) {
    const now = new Date();
    const weekday = localWeekday(now);
    const dayKey = localDayKey(now);
    const atTime = formatLocalHHmm(now);
    const tenMinBeforeTarget = formatLocalHHmm(addMinutesLocal(now, 10));
    const logDate = startOfTodayLocal(now);
    const expiresAt = endOfTodayLocal(now);

    const tasks = await this.prisma.dailyTask.findMany({
      where: { userId, weekday, isActive: true },
      select: { id: true, title: true, scheduledAt: true },
    });
    if (tasks.length === 0) {
      return;
    }

    const completions = await this.prisma.taskCompletion.findMany({
      where: {
        taskId: { in: tasks.map((task) => task.id) },
        logDate,
      },
      select: { taskId: true },
    });
    const completedTaskIds = new Set(completions.map((entry) => entry.taskId));

    for (const task of tasks) {
      if (completedTaskIds.has(task.id)) {
        continue;
      }

      if (task.scheduledAt === tenMinBeforeTarget) {
        await this.notifications.emit(userId, {
          dedupeKey: `task-10m-${task.id}-${dayKey}`,
          period: NotificationPeriod.DAILY,
          category: NotificationCategory.TASKS,
          kind: NotificationKind.REMINDER,
          title: `In 10 minutes you have ${task.title}`,
          body: task.scheduledAt,
          href: '/',
          ctaLabel: 'View tasks',
          expiresAt,
        });
      }

      if (task.scheduledAt === atTime) {
        await this.notifications.emit(userId, {
          dedupeKey: `task-now-${task.id}-${dayKey}`,
          period: NotificationPeriod.DAILY,
          category: NotificationCategory.TASKS,
          kind: NotificationKind.REMINDER,
          priority: NotificationPriority.URGENT,
          title: `It's time to do ${task.title}`,
          body: task.scheduledAt,
          href: '/',
          ctaLabel: 'Complete task',
          expiresAt,
        });
      }
    }
  }
}
