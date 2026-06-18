import { Injectable } from '@nestjs/common';
import {
  NotificationCategory,
  NotificationKind,
  NotificationPeriod,
  NotificationPriority,
  Prisma,
  TransactionType,
} from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import type {
  GenerateNotificationsDto,
  NotificationQueryDto,
  NotificationVm,
} from './dto/notification.dto';

function todayUtc() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function toIsoDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

function startOfWeekUtc(now = new Date()) {
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const weekday = date.getUTCDay();
  const diff = weekday === 0 ? 6 : weekday - 1;
  date.setUTCDate(date.getUTCDate() - diff);
  return date;
}

function startOfMonthUtc(now = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  private async createIfMissing(input: {
    userId: string;
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
  }) {
    const existing = await this.prisma.notification.findFirst({
      where: {
        userId: input.userId,
        dedupeKey: input.dedupeKey,
      },
      select: { id: true },
    });
    if (existing) return existing;
    return this.prisma.notification.create({
      data: {
        userId: input.userId,
        dedupeKey: input.dedupeKey,
        period: input.period,
        category: input.category,
        kind: input.kind,
        priority: input.priority ?? NotificationPriority.NORMAL,
        title: input.title,
        body: input.body,
        href: input.href,
        ctaLabel: input.ctaLabel,
        metadata: input.metadata ?? undefined,
      },
    });
  }

  private async generateDaily(userId: string) {
    const now = new Date();
    const dayKey = toIsoDate(todayUtc());
    const weekday = now.getUTCDay() === 0 ? 7 : now.getUTCDay();

    const [activeTasks, completedToday, mealsToday, trainingToday, investments, txToday, user] =
      await Promise.all([
        this.prisma.dailyTask.count({
          where: { userId, weekday, isActive: true },
        }),
        this.prisma.taskCompletion.count({
          where: {
            task: { userId, weekday, isActive: true },
            logDate: todayUtc(),
          },
        }),
        this.prisma.dietMeal.count({ where: { userId, weekday, isActive: true } }),
        this.prisma.workoutDayPlan.count({ where: { userId, weekday, isActive: true } }),
        this.prisma.investment.findMany({
          where: { userId },
          select: { ticker: true, avgPrice: true, currentPrice: true },
          take: 20,
        }),
        this.prisma.transaction.aggregate({
          where: {
            userId,
            date: { gte: todayUtc(), lt: new Date(todayUtc().getTime() + 24 * 60 * 60 * 1000) },
            type: TransactionType.EXPENSE,
          },
          _sum: { amount: true },
        }),
        this.prisma.user.findUnique({
          where: { id: userId },
          select: { monthlyIncome: true },
        }),
      ]);

    const pendingTasks = Math.max(0, activeTasks - completedToday);
    if (activeTasks > 0 || mealsToday > 0 || trainingToday > 0) {
      await this.createIfMissing({
        userId,
        dedupeKey: `daily-routine-${dayKey}`,
        period: NotificationPeriod.DAILY,
        category: NotificationCategory.SYSTEM,
        kind: NotificationKind.REMINDER,
        title: "Today's routine summary",
        body: `${pendingTasks} pending tasks, ${mealsToday} planned meals, and ${trainingToday} workout(s) today.`,
        href: '/',
        ctaLabel: 'View routine',
      });
    }

    let best: { ticker: string; change: number } | null = null;
    let worst: { ticker: string; change: number } | null = null;
    for (const item of investments) {
      const avg = Number(item.avgPrice);
      const current = Number(item.currentPrice);
      if (avg <= 0 || current <= 0) continue;
      const change = ((current - avg) / avg) * 100;
      if (!best || change > best.change) best = { ticker: item.ticker, change };
      if (!worst || change < worst.change) worst = { ticker: item.ticker, change };
    }

    if (best && best.change >= 5) {
      await this.createIfMissing({
        userId,
        dedupeKey: `daily-market-up-${dayKey}-${best.ticker}`,
        period: NotificationPeriod.DAILY,
        category: NotificationCategory.WALLET,
        kind: NotificationKind.INSIGHT,
        title: `${best.ticker} significant gain`,
        body: `The asset is up +${best.change.toFixed(1)}% vs your average price.`,
        href: '/wallet-investments',
        ctaLabel: 'View wallet',
      });
    }

    if (worst && worst.change <= -5) {
      await this.createIfMissing({
        userId,
        dedupeKey: `daily-market-down-${dayKey}-${worst.ticker}`,
        period: NotificationPeriod.DAILY,
        category: NotificationCategory.WALLET,
        kind: NotificationKind.ALERT,
        priority: NotificationPriority.URGENT,
        title: `${worst.ticker} significant drop`,
        body: `The asset is ${worst.change.toFixed(1)}% below your average price.`,
        href: '/wallet-investments',
        ctaLabel: 'Review position',
      });
    }

    const spentToday = Number(txToday._sum.amount ?? 0);
    const dailyBudget = Number(user?.monthlyIncome ?? 0) > 0 ? Number(user?.monthlyIncome) / 30 : 0;
    if (dailyBudget > 0 && spentToday >= dailyBudget * 0.8) {
      await this.createIfMissing({
        userId,
        dedupeKey: `daily-spending-${dayKey}`,
        period: NotificationPeriod.DAILY,
        category: NotificationCategory.FINANCE,
        kind: NotificationKind.ALERT,
        priority: spentToday > dailyBudget ? NotificationPriority.URGENT : NotificationPriority.NORMAL,
        title: 'Daily spending limit approaching',
        body: `You have spent ${spentToday.toFixed(2)} USDT today, with an estimated daily budget of ${dailyBudget.toFixed(2)} USDT.`,
        href: '/monthly-expenses',
        ctaLabel: 'View expenses',
      });
    }
  }

  private async generateWeekly(userId: string) {
    const weekStart = startOfWeekUtc();
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    const weekKey = `${toIsoDate(weekStart)}_${toIsoDate(weekEnd)}`;

    const [income, expense, invested, goalsWithoutProgress] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: {
          userId,
          date: { gte: weekStart, lt: weekEnd },
          type: TransactionType.INCOME,
        },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: {
          userId,
          date: { gte: weekStart, lt: weekEnd },
          type: TransactionType.EXPENSE,
        },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: {
          userId,
          date: { gte: weekStart, lt: weekEnd },
          category: { in: ['INVESTMENT_BUY', 'POSITION_REGISTER'] },
        },
        _sum: { amount: true },
      }),
      this.prisma.financialGoal.findMany({
        where: { userId, isSystem: false },
        select: {
          id: true,
          title: true,
          activities: {
            where: { createdAt: { gte: weekStart, lt: weekEnd } },
            select: { id: true },
            take: 1,
          },
        },
      }),
    ]);

    const totalIncome = Number(income._sum.amount ?? 0);
    const totalExpense = Number(expense._sum.amount ?? 0);
    const totalInvested = Number(invested._sum.amount ?? 0);

    await this.createIfMissing({
      userId,
      dedupeKey: `weekly-summary-${weekKey}`,
      period: NotificationPeriod.WEEKLY,
      category: NotificationCategory.FINANCE,
      kind: NotificationKind.UPDATE,
      title: 'Weekly financial summary available',
      body: `Invested: ${totalInvested.toFixed(2)} USDT · Spent: ${totalExpense.toFixed(2)} USDT · Income: ${totalIncome.toFixed(2)} USDT.`,
      href: '/notifications',
      ctaLabel: 'View summary',
    });

    if (totalInvested <= 0) {
      await this.createIfMissing({
        userId,
        dedupeKey: `weekly-no-investment-${weekKey}`,
        period: NotificationPeriod.WEEKLY,
        category: NotificationCategory.WALLET,
        kind: NotificationKind.REMINDER,
        title: 'No investments this week',
        body: 'You did not record any contributions this week. Consider reviewing your strategy.',
        href: '/wallet-investments',
        ctaLabel: 'Invest now',
      });
    }

    const staleGoals = goalsWithoutProgress.filter((goal) => goal.activities.length === 0);
    if (staleGoals.length > 0) {
      await this.createIfMissing({
        userId,
        dedupeKey: `weekly-goals-stale-${weekKey}`,
        period: NotificationPeriod.WEEKLY,
        category: NotificationCategory.GOALS,
        kind: NotificationKind.ALERT,
        title: 'Goals without progress this week',
        body: `${staleGoals.length} goal(s) had no progress. Review contributions and priorities.`,
        href: '/finance-goals',
        ctaLabel: 'Review goals',
      });
    }
  }

  private async generateMonthly(userId: string) {
    const monthStart = startOfMonthUtc();
    const nextMonth = new Date(
      Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 1),
    );
    const monthKey = toIsoDate(monthStart).slice(0, 7);

    const [income, expense, goals] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: {
          userId,
          date: { gte: monthStart, lt: nextMonth },
          type: TransactionType.INCOME,
        },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: {
          userId,
          date: { gte: monthStart, lt: nextMonth },
          type: TransactionType.EXPENSE,
        },
        _sum: { amount: true },
      }),
      this.prisma.financialGoal.findMany({
        where: { userId, isSystem: false },
        select: { currentAmount: true, targetAmount: true },
      }),
    ]);

    const totalIncome = Number(income._sum.amount ?? 0);
    const totalExpense = Number(expense._sum.amount ?? 0);
    const net = totalIncome - totalExpense;
    const goalsCompleted = goals.filter(
      (goal) => Number(goal.targetAmount) > 0 && Number(goal.currentAmount) >= Number(goal.targetAmount),
    ).length;

    await this.createIfMissing({
      userId,
      dedupeKey: `monthly-summary-${monthKey}`,
      period: NotificationPeriod.MONTHLY,
      category: NotificationCategory.FINANCE,
      kind: NotificationKind.UPDATE,
      title: 'Monthly summary ready',
      body: `Income: ${totalIncome.toFixed(2)} USDT · Expenses: ${totalExpense.toFixed(2)} USDT · Net result: ${net.toFixed(2)} USDT.`,
      href: '/notifications',
      ctaLabel: 'Open summary',
    });

    await this.createIfMissing({
      userId,
      dedupeKey: `monthly-goals-${monthKey}`,
      period: NotificationPeriod.MONTHLY,
      category: NotificationCategory.GOALS,
      kind: NotificationKind.INSIGHT,
      title: 'Monthly goals overview',
      body: `${goalsCompleted} goal(s) completed this month. Review overdue and stagnant goals.`,
      href: '/finance-goals',
      ctaLabel: 'View goals',
    });
  }

  async generateOnDemand(userId: string, options?: GenerateNotificationsDto) {
    const includeDaily = options?.includeDaily ?? true;
    const includeWeekly = options?.includeWeekly ?? true;
    const includeMonthly = options?.includeMonthly ?? true;

    if (includeDaily) {
      await this.generateDaily(userId);
    }
    if (includeWeekly) {
      await this.generateWeekly(userId);
    }
    if (includeMonthly) {
      await this.generateMonthly(userId);
    }
    return { ok: true };
  }

  private mapNotification(item: {
    id: string;
    category: NotificationCategory;
    kind: NotificationKind;
    priority: NotificationPriority;
    period: NotificationPeriod;
    title: string;
    body: string;
    read: boolean;
    href: string | null;
    ctaLabel: string | null;
    createdAt: Date;
  }): NotificationVm {
    return {
      id: item.id,
      category: item.category.toLowerCase() as NotificationVm['category'],
      kind: item.kind.toLowerCase() as NotificationVm['kind'],
      priority: item.priority.toLowerCase() as NotificationVm['priority'],
      period: item.period.toLowerCase() as NotificationVm['period'],
      title: item.title,
      body: item.body,
      read: item.read,
      href: item.href,
      ctaLabel: item.ctaLabel,
      createdAt: item.createdAt.toISOString(),
    };
  }

  async list(userId: string, query: NotificationQueryDto) {
    await this.generateOnDemand(userId);
    const items = await this.prisma.notification.findMany({
      where: {
        userId,
        ...(query.period ? { period: query.period } : {}),
        ...(query.kind ? { kind: query.kind } : {}),
        ...(query.category ? { category: query.category } : {}),
        ...(query.unreadOnly ? { read: false } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: query.limit ?? 100,
    });

    const unreadCount = await this.prisma.notification.count({
      where: { userId, read: false },
    });

    return {
      unreadCount,
      items: items.map((item) => this.mapNotification(item)),
    };
  }

  async markRead(userId: string, id: string, read = true) {
    const existing = await this.prisma.notification.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return { ok: false };
    }
    await this.prisma.notification.update({
      where: { id },
      data: {
        read,
        readAt: read ? new Date() : null,
      },
    });
    return { ok: true };
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true, readAt: new Date() },
    });
    return { ok: true };
  }
}
