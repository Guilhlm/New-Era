import { Injectable, Logger } from '@nestjs/common';
import {
  NotificationCategory,
  NotificationKind,
  NotificationPeriod,
  NotificationPriority,
  TaskSourceType,
  TransactionType,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { GenerateNotificationsDto } from './dto/notification.dto';
import {
  addDays,
  isoWeekday,
  monthKey,
  patrimonyMilestone,
  round,
  startOfMonthUtc,
  startOfWeekUtc,
  todayUtc,
  toIsoDate,
} from './notification.helpers';
import { NotificationService } from './notification.service';

/**
 * Builds recurring reminders, dynamic business alerts and insights from the
 * user's data. Each rule group is isolated so a single failure never aborts the
 * rest of the generation pass.
 */
@Injectable()
export class NotificationGeneratorService {
  private readonly logger = new Logger(NotificationGeneratorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationService,
  ) {}

  private async run(label: string, task: () => Promise<void>) {
    try {
      await task();
    } catch (error) {
      this.logger.warn(
        `Notification rule "${label}" failed: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );
    }
  }

  async generate(userId: string, options?: GenerateNotificationsDto) {
    const includeDaily = options?.includeDaily ?? true;
    const includeWeekly = options?.includeWeekly ?? true;
    const includeMonthly = options?.includeMonthly ?? true;

    if (includeDaily) {
      await this.run('daily-routine', () => this.dailyRoutine(userId));
      await this.run('daily-reminders', () => this.dailyReminders(userId));
      await this.run('daily-spending', () => this.dailySpending(userId));
      await this.run('market-oscillation', () => this.marketOscillation(userId));
      await this.run('budget-limits', () => this.budgetLimits(userId));
      await this.run('overdue-tasks', () => this.overdueTasks(userId));
      await this.run('training-absence', () => this.trainingAbsence(userId));
      await this.run('patrimony-milestone', () => this.patrimonyMilestone(userId));
      await this.run('insights', () => this.insights(userId));
    }
    if (includeWeekly) {
      await this.run('weekly', () => this.weekly(userId));
    }
    if (includeMonthly) {
      await this.run('monthly', () => this.monthly(userId));
    }
    return { ok: true };
  }

  async generateForAllUsers(options?: GenerateNotificationsDto) {
    const users = await this.prisma.user.findMany({ select: { id: true } });
    const batchSize = 5;
    for (let index = 0; index < users.length; index += batchSize) {
      const batch = users.slice(index, index + batchSize);
      await Promise.all(
        batch.map((user) =>
          this.run(`user-${user.id}`, () => this.generate(user.id, options).then(() => undefined)),
        ),
      );
    }
    return { ok: true, users: users.length };
  }

  // -------------------------------------------------------------------------
  // Recurring reminders (daily)
  // -------------------------------------------------------------------------

  private async dailyRoutine(userId: string) {
    const dayKey = toIsoDate(todayUtc());
    const weekday = isoWeekday();
    const [activeTasks, completedToday, mealsToday, trainingToday] = await Promise.all([
      this.prisma.dailyTask.count({ where: { userId, weekday, isActive: true } }),
      this.prisma.taskCompletion.count({
        where: { task: { userId, weekday, isActive: true }, logDate: todayUtc() },
      }),
      this.prisma.dietMeal.count({ where: { userId, weekday, isActive: true } }),
      this.prisma.workoutDayPlan.count({ where: { userId, weekday, isActive: true } }),
    ]);

    if (activeTasks === 0 && mealsToday === 0 && trainingToday === 0) return;
    const pendingTasks = Math.max(0, activeTasks - completedToday);

    await this.notifications.upsert(userId, {
      dedupeKey: `daily-routine-${dayKey}`,
      period: NotificationPeriod.DAILY,
      category: NotificationCategory.SYSTEM,
      kind: NotificationKind.REMINDER,
      title: "Today's routine summary",
      body: `${pendingTasks} pending task(s), ${mealsToday} planned meal(s) and ${trainingToday} workout(s) today.`,
      href: '/',
      ctaLabel: 'View routine',
      metadata: { pendingTasks, mealsToday, trainingToday },
      expiresAt: addDays(todayUtc(), 1),
    });
  }

  private async dailyReminders(userId: string) {
    const dayKey = toIsoDate(todayUtc());
    const weekday = isoWeekday();
    const dayStart = todayUtc();
    const dayEnd = addDays(dayStart, 1);

    const [weightToday, waterToday, trainingPlan, mealsToday] = await Promise.all([
      this.prisma.bodyMeasure.count({
        where: { userId, recordedAt: { gte: dayStart, lt: dayEnd } },
      }),
      this.prisma.waterLog.findFirst({
        where: { userId, logDate: { gte: dayStart, lt: dayEnd } },
        select: { waterIntake: true, waterTotal: true },
      }),
      this.prisma.workoutDayPlan.findFirst({
        where: { userId, weekday, isActive: true },
        select: { title: true },
      }),
      this.prisma.dietMeal.count({ where: { userId, weekday, isActive: true } }),
    ]);

    if (weightToday === 0) {
      await this.notifications.upsert(userId, {
        dedupeKey: `daily-weight-${dayKey}`,
        period: NotificationPeriod.DAILY,
        category: NotificationCategory.BODY,
        kind: NotificationKind.REMINDER,
        title: "Log today's weight",
        body: "You haven't logged your weight today. Daily tracking improves your insights.",
        href: '/body-metrics',
        ctaLabel: 'Log weight',
        expiresAt: dayEnd,
      });
    }

    const intake = Number(waterToday?.waterIntake ?? 0);
    const target = Number(waterToday?.waterTotal ?? 0);
    if (!waterToday || (target > 0 && intake < target)) {
      await this.notifications.upsert(userId, {
        dedupeKey: `daily-water-${dayKey}`,
        period: NotificationPeriod.DAILY,
        category: NotificationCategory.DIET,
        kind: NotificationKind.REMINDER,
        title: 'Track your water intake',
        body: waterToday
          ? `You drank ${round(intake)} of your ${round(target)} water goal today.`
          : "You haven't logged your water intake today.",
        href: '/diet-area',
        ctaLabel: 'Log water',
        expiresAt: dayEnd,
      });
    }

    if (trainingPlan) {
      await this.notifications.upsert(userId, {
        dedupeKey: `daily-training-${dayKey}`,
        period: NotificationPeriod.DAILY,
        category: NotificationCategory.TRAINING,
        kind: NotificationKind.REMINDER,
        title: "Today's workout",
        body: `Today is "${trainingPlan.title}" day. Don't forget to do your workout.`,
        href: '/training-area',
        ctaLabel: 'View workout',
        expiresAt: dayEnd,
      });
    }

    if (mealsToday > 0) {
      await this.notifications.upsert(userId, {
        dedupeKey: `daily-diet-${dayKey}`,
        period: NotificationPeriod.DAILY,
        category: NotificationCategory.DIET,
        kind: NotificationKind.REMINDER,
        title: "Review today's diet",
        body: `You have ${mealsToday} planned meal(s) today. Check if you're following the plan.`,
        href: '/diet-area',
        ctaLabel: 'View diet',
        expiresAt: dayEnd,
      });
    }
  }

  // -------------------------------------------------------------------------
  // Dynamic alerts (daily)
  // -------------------------------------------------------------------------

  private async dailySpending(userId: string) {
    const dayKey = toIsoDate(todayUtc());
    const dayStart = todayUtc();
    const dayEnd = addDays(dayStart, 1);
    const [txToday, user] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { userId, date: { gte: dayStart, lt: dayEnd }, type: TransactionType.EXPENSE },
        _sum: { amount: true },
      }),
      this.prisma.user.findUnique({ where: { id: userId }, select: { monthlyIncome: true } }),
    ]);

    const spentToday = Number(txToday._sum.amount ?? 0);
    const dailyBudget = Number(user?.monthlyIncome ?? 0) > 0 ? Number(user?.monthlyIncome) / 30 : 0;
    if (dailyBudget <= 0 || spentToday < dailyBudget * 0.8) return;

    await this.notifications.upsert(userId, {
      dedupeKey: `daily-spending-${dayKey}`,
      period: NotificationPeriod.DAILY,
      category: NotificationCategory.FINANCE,
      kind: NotificationKind.ALERT,
      priority:
        spentToday > dailyBudget ? NotificationPriority.URGENT : NotificationPriority.NORMAL,
      title: 'Daily spending limit approaching',
      body: `You spent ${round(spentToday)} USDT today, with an estimated daily budget of ${round(dailyBudget)} USDT.`,
      href: '/monthly-expenses',
      ctaLabel: 'View expenses',
      metadata: { spentToday: round(spentToday), dailyBudget: round(dailyBudget) },
      expiresAt: dayEnd,
    });
  }

  private async marketOscillation(userId: string) {
    const dayKey = toIsoDate(todayUtc());
    const investments = await this.prisma.investment.findMany({
      where: { userId },
      select: { ticker: true, avgPrice: true, currentPrice: true },
      take: 50,
    });

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
      await this.notifications.upsert(userId, {
        dedupeKey: `daily-market-up-${dayKey}-${best.ticker}`,
        period: NotificationPeriod.DAILY,
        category: NotificationCategory.WALLET,
        kind: NotificationKind.INSIGHT,
        title: `${best.ticker} significant gain`,
        body: `The asset is up +${best.change.toFixed(1)}% vs your average price.`,
        href: '/wallet-investments',
        ctaLabel: 'View wallet',
        metadata: { ticker: best.ticker, change: round(best.change, 1) },
        expiresAt: addDays(todayUtc(), 1),
      });
    }

    if (worst && worst.change <= -5) {
      await this.notifications.upsert(userId, {
        dedupeKey: `daily-market-down-${dayKey}-${worst.ticker}`,
        period: NotificationPeriod.DAILY,
        category: NotificationCategory.WALLET,
        kind: NotificationKind.ALERT,
        priority: NotificationPriority.URGENT,
        title: `${worst.ticker} significant drop`,
        body: `The asset is ${worst.change.toFixed(1)}% below your average price.`,
        href: '/wallet-investments',
        ctaLabel: 'Review position',
        metadata: { ticker: worst.ticker, change: round(worst.change, 1) },
        expiresAt: addDays(todayUtc(), 1),
      });
    }
  }

  private async budgetLimits(userId: string) {
    const key = monthKey();
    const monthStart = startOfMonthUtc();
    const nextMonth = new Date(
      Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 1),
    );

    const categories = await this.prisma.monthlyExpenseCategory.findMany({
      where: { userId, budget: { gt: 0 } },
      select: { id: true, name: true, budget: true },
    });
    if (categories.length === 0) return;

    for (const category of categories) {
      const spent = await this.prisma.monthlyExpense.aggregate({
        where: {
          userId,
          categoryId: category.id,
          createdAt: { gte: monthStart, lt: nextMonth },
        },
        _sum: { amount: true },
      });
      const total = Number(spent._sum.amount ?? 0);
      const budget = Number(category.budget);
      if (budget <= 0 || total < budget * 0.8) continue;

      const ratio = round((total / budget) * 100, 0);
      await this.notifications.upsert(userId, {
        dedupeKey: `budget-${key}-${category.id}`,
        period: NotificationPeriod.MONTHLY,
        category: NotificationCategory.FINANCE,
        kind: NotificationKind.ALERT,
        priority: total >= budget ? NotificationPriority.URGENT : NotificationPriority.NORMAL,
        title:
          total >= budget
            ? `"${category.name}" budget exceeded`
            : `"${category.name}" budget near limit`,
        body: `You used ${round(total)} of ${round(budget)} USDT (${ratio}%) in "${category.name}" this month.`,
        href: '/monthly-expenses',
        ctaLabel: 'View expenses',
        metadata: { category: category.name, spent: round(total), budget: round(budget), ratio },
      });
    }
  }

  private async overdueTasks(userId: string) {
    const dayKey = toIsoDate(todayUtc());
    const weekday = isoWeekday();
    const [activeTasks, completedToday] = await Promise.all([
      this.prisma.dailyTask.count({ where: { userId, weekday, isActive: true } }),
      this.prisma.taskCompletion.count({
        where: { task: { userId, weekday, isActive: true }, logDate: todayUtc() },
      }),
    ]);
    const pending = Math.max(0, activeTasks - completedToday);
    if (pending <= 0) return;

    await this.notifications.upsert(userId, {
      dedupeKey: `tasks-pending-${dayKey}`,
      period: NotificationPeriod.DAILY,
      category: NotificationCategory.TASKS,
      kind: NotificationKind.ALERT,
      priority: pending >= 3 ? NotificationPriority.URGENT : NotificationPriority.NORMAL,
      title: 'Pending tasks for today',
      body: `You have ${pending} task(s) still not completed today.`,
      href: '/',
      ctaLabel: 'Complete tasks',
      metadata: { pending },
      expiresAt: addDays(todayUtc(), 1),
    });
  }

  private async trainingAbsence(userId: string) {
    const threshold = 3;
    const since = addDays(todayUtc(), -14);
    const lastCompletion = await this.prisma.taskCompletion.findFirst({
      where: {
        task: { userId, sourceType: TaskSourceType.WORKOUT },
        logDate: { gte: since },
      },
      orderBy: { logDate: 'desc' },
      select: { logDate: true },
    });

    const hasWorkoutPlan = await this.prisma.workoutDayPlan.count({
      where: { userId, isActive: true },
    });
    if (hasWorkoutPlan === 0) return;

    const lastDate = lastCompletion?.logDate ?? null;
    const daysSince = lastDate
      ? Math.floor((todayUtc().getTime() - lastDate.getTime()) / (24 * 60 * 60 * 1000))
      : 99;
    if (daysSince < threshold) return;

    await this.notifications.upsert(userId, {
      dedupeKey: `training-absence-${toIsoDate(todayUtc())}`,
      period: NotificationPeriod.DAILY,
      category: NotificationCategory.TRAINING,
      kind: NotificationKind.ALERT,
      title: 'No recent workouts',
      body: lastDate
        ? `It's been ${daysSince} day(s) since your last logged workout. Time to get back on track?`
        : "You haven't logged any workouts in the past weeks. Time to get back on track?",
      href: '/training-area',
      ctaLabel: 'View workouts',
      metadata: { daysSince },
      expiresAt: addDays(todayUtc(), 1),
    });
  }

  private async patrimonyMilestone(userId: string) {
    const investments = await this.prisma.investment.findMany({
      where: { userId },
      select: { currentValue: true },
    });
    const total = investments.reduce((sum, item) => sum + Number(item.currentValue ?? 0), 0);
    const milestone = patrimonyMilestone(total);
    if (milestone <= 0) return;

    await this.notifications.upsert(userId, {
      dedupeKey: `patrimony-milestone-${milestone}`,
      period: NotificationPeriod.MONTHLY,
      category: NotificationCategory.WALLET,
      kind: NotificationKind.INSIGHT,
      title: 'Net worth milestone reached',
      body: `Your invested net worth passed ${milestone.toLocaleString('en-US')} USDT. Keep it up!`,
      href: '/wallet-investments',
      ctaLabel: 'View wallet',
      metadata: { milestone, total: round(total) },
    });
  }

  // -------------------------------------------------------------------------
  // Insights / trends
  // -------------------------------------------------------------------------

  private async insights(userId: string) {
    const weekKey = toIsoDate(startOfWeekUtc());

    const measures = await this.prisma.bodyMeasure.findMany({
      where: { userId, weight: { not: null } },
      orderBy: { recordedAt: 'desc' },
      take: 5,
      select: { weight: true, recordedAt: true },
    });
    if (measures.length >= 2) {
      const latest = Number(measures[0].weight ?? 0);
      const previous = Number(measures[measures.length - 1].weight ?? 0);
      const delta = round(latest - previous);
      if (latest > 0 && previous > 0 && Math.abs(delta) >= 0.5) {
        await this.notifications.upsert(userId, {
          dedupeKey: `insight-weight-${weekKey}`,
          period: NotificationPeriod.WEEKLY,
          category: NotificationCategory.BODY,
          kind: NotificationKind.INSIGHT,
          title: 'Your weight evolution',
          body:
            delta < 0
              ? `Your weight dropped ${Math.abs(delta)} kg over recent measurements. Great progress!`
              : `Your weight rose ${delta} kg over recent measurements. Keep an eye on your goal.`,
          href: '/body-metrics',
          ctaLabel: 'View metrics',
          metadata: { delta, latest, previous },
        });
      }
    }

    const thisWeekStart = startOfWeekUtc();
    const lastWeekStart = addDays(thisWeekStart, -7);
    const [thisWeek, lastWeek] = await Promise.all([
      this.prisma.taskCompletion.count({
        where: {
          task: { userId, sourceType: TaskSourceType.WORKOUT },
          logDate: { gte: thisWeekStart },
        },
      }),
      this.prisma.taskCompletion.count({
        where: {
          task: { userId, sourceType: TaskSourceType.WORKOUT },
          logDate: { gte: lastWeekStart, lt: thisWeekStart },
        },
      }),
    ]);
    if (thisWeek > lastWeek && thisWeek >= 2) {
      await this.notifications.upsert(userId, {
        dedupeKey: `insight-training-consistency-${weekKey}`,
        period: NotificationPeriod.WEEKLY,
        category: NotificationCategory.TRAINING,
        kind: NotificationKind.INSIGHT,
        title: 'Workout consistency is up',
        body: `You worked out ${thisWeek} time(s) this week, more than ${lastWeek} last week. Keep going!`,
        href: '/training-area',
        ctaLabel: 'View workouts',
        metadata: { thisWeek, lastWeek },
      });
    }

    await this.savingsInsight(userId);
    await this.patrimonyGrowthInsight(userId);
    await this.goalStreakInsight(userId);
  }

  private async savingsInsight(userId: string) {
    const key = monthKey();
    const monthStart = startOfMonthUtc();
    const nextMonth = new Date(
      Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 1),
    );
    const prevMonthStart = new Date(
      Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() - 1, 1),
    );

    const computeRate = async (start: Date, end: Date) => {
      const [income, expense] = await Promise.all([
        this.prisma.transaction.aggregate({
          where: { userId, date: { gte: start, lt: end }, type: TransactionType.INCOME },
          _sum: { amount: true },
        }),
        this.prisma.transaction.aggregate({
          where: { userId, date: { gte: start, lt: end }, type: TransactionType.EXPENSE },
          _sum: { amount: true },
        }),
      ]);
      const totalIncome = Number(income._sum.amount ?? 0);
      const totalExpense = Number(expense._sum.amount ?? 0);
      if (totalIncome <= 0) return null;
      return ((totalIncome - totalExpense) / totalIncome) * 100;
    };

    const [current, previous] = await Promise.all([
      computeRate(monthStart, nextMonth),
      computeRate(prevMonthStart, monthStart),
    ]);
    if (current === null || previous === null) return;
    if (current <= previous || current - previous < 2) return;

    await this.notifications.upsert(userId, {
      dedupeKey: `insight-savings-${key}`,
      period: NotificationPeriod.MONTHLY,
      category: NotificationCategory.FINANCE,
      kind: NotificationKind.INSIGHT,
      title: 'Your savings rate increased',
      body: `You're saving ${round(current, 0)}% of your income this month, up from ${round(previous, 0)}% last month.`,
      href: '/monthly-expenses',
      ctaLabel: 'View finances',
      metadata: { current: round(current, 0), previous: round(previous, 0) },
    });
  }

  private async patrimonyGrowthInsight(userId: string) {
    const key = monthKey();
    const snapshots = await this.prisma.portfolioSnapshot.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 30,
      select: { totalValue: true, date: true },
    });
    if (snapshots.length < 2) return;

    const latest = Number(snapshots[0].totalValue ?? 0);
    const oldest = Number(snapshots[snapshots.length - 1].totalValue ?? 0);
    if (oldest <= 0 || latest <= oldest) return;
    const growth = round(((latest - oldest) / oldest) * 100, 1);
    if (growth < 1) return;

    await this.notifications.upsert(userId, {
      dedupeKey: `insight-patrimony-growth-${key}`,
      period: NotificationPeriod.MONTHLY,
      category: NotificationCategory.WALLET,
      kind: NotificationKind.INSIGHT,
      title: 'Net worth growth',
      body: `Your net worth grew ${growth}% recently. Great job with your investments!`,
      href: '/wallet-investments',
      ctaLabel: 'View wallet',
      metadata: { growth, latest: round(latest), oldest: round(oldest) },
    });
  }

  private async goalStreakInsight(userId: string) {
    const key = monthKey();
    const goals = await this.prisma.financialGoal.findMany({
      where: { userId, isSystem: false },
      select: { currentAmount: true, targetAmount: true },
    });
    const completed = goals.filter(
      (goal) =>
        Number(goal.targetAmount) > 0 && Number(goal.currentAmount) >= Number(goal.targetAmount),
    ).length;
    if (completed < 2) return;

    await this.notifications.upsert(userId, {
      dedupeKey: `insight-goal-streak-${key}`,
      period: NotificationPeriod.MONTHLY,
      category: NotificationCategory.GOALS,
      kind: NotificationKind.INSIGHT,
      title: 'Goals on a streak',
      body: `You've completed ${completed} financial goals. Such consistency!`,
      href: '/finance-goals',
      ctaLabel: 'View goals',
      metadata: { completed },
    });
  }

  // -------------------------------------------------------------------------
  // Weekly
  // -------------------------------------------------------------------------

  private async weekly(userId: string) {
    const weekStart = startOfWeekUtc();
    const weekEnd = addDays(weekStart, 7);
    const weekKey = `${toIsoDate(weekStart)}_${toIsoDate(weekEnd)}`;

    const [income, expense, invested, goals] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { userId, date: { gte: weekStart, lt: weekEnd }, type: TransactionType.INCOME },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { userId, date: { gte: weekStart, lt: weekEnd }, type: TransactionType.EXPENSE },
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

    await this.notifications.upsert(userId, {
      dedupeKey: `weekly-summary-${weekKey}`,
      period: NotificationPeriod.WEEKLY,
      category: NotificationCategory.FINANCE,
      kind: NotificationKind.UPDATE,
      title: 'Weekly financial summary',
      body: `Invested: ${round(totalInvested)} USDT · Spent: ${round(totalExpense)} USDT · Income: ${round(totalIncome)} USDT.`,
      href: '/notifications',
      ctaLabel: 'View summary',
      metadata: {
        invested: round(totalInvested),
        expense: round(totalExpense),
        income: round(totalIncome),
      },
    });

    if (totalInvested <= 0) {
      await this.notifications.upsert(userId, {
        dedupeKey: `weekly-no-investment-${weekKey}`,
        period: NotificationPeriod.WEEKLY,
        category: NotificationCategory.WALLET,
        kind: NotificationKind.REMINDER,
        title: 'No contributions this week',
        body: "You didn't record any contributions this week. Consider reviewing your strategy.",
        href: '/wallet-investments',
        ctaLabel: 'Invest now',
      });
    }

    const staleGoals = goals.filter((goal) => goal.activities.length === 0);
    if (staleGoals.length > 0) {
      await this.notifications.upsert(userId, {
        dedupeKey: `weekly-goals-stale-${weekKey}`,
        period: NotificationPeriod.WEEKLY,
        category: NotificationCategory.GOALS,
        kind: NotificationKind.ALERT,
        title: 'Goals without progress this week',
        body: `${staleGoals.length} goal(s) had no progress. Review contributions and priorities.`,
        href: '/finance-goals',
        ctaLabel: 'Review goals',
        metadata: { staleGoals: staleGoals.length },
      });
    }
  }

  // -------------------------------------------------------------------------
  // Monthly
  // -------------------------------------------------------------------------

  private async monthly(userId: string) {
    const key = monthKey();
    const monthStart = startOfMonthUtc();
    const nextMonth = new Date(
      Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 1),
    );

    const [income, expense, goals] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { userId, date: { gte: monthStart, lt: nextMonth }, type: TransactionType.INCOME },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { userId, date: { gte: monthStart, lt: nextMonth }, type: TransactionType.EXPENSE },
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
      (goal) =>
        Number(goal.targetAmount) > 0 && Number(goal.currentAmount) >= Number(goal.targetAmount),
    ).length;

    await this.notifications.upsert(userId, {
      dedupeKey: `monthly-summary-${key}`,
      period: NotificationPeriod.MONTHLY,
      category: NotificationCategory.FINANCE,
      kind: NotificationKind.UPDATE,
      title: 'Monthly summary ready',
      body: `Income: ${round(totalIncome)} USDT · Expenses: ${round(totalExpense)} USDT · Net result: ${round(net)} USDT.`,
      href: '/notifications',
      ctaLabel: 'Open summary',
      metadata: { income: round(totalIncome), expense: round(totalExpense), net: round(net) },
    });

    await this.notifications.upsert(userId, {
      dedupeKey: `monthly-goals-${key}`,
      period: NotificationPeriod.MONTHLY,
      category: NotificationCategory.GOALS,
      kind: NotificationKind.INSIGHT,
      title: 'Monthly goals overview',
      body: `${goalsCompleted} goal(s) completed this month. Review overdue and stagnant goals.`,
      href: '/finance-goals',
      ctaLabel: 'View goals',
      metadata: { goalsCompleted },
    });

    await this.notifications.upsert(userId, {
      dedupeKey: `monthly-close-${key}`,
      period: NotificationPeriod.MONTHLY,
      category: NotificationCategory.FINANCE,
      kind: NotificationKind.REMINDER,
      title: 'Close the financial month',
      body: 'Review income, expenses and investments to close the month clearly.',
      href: '/monthly-expenses',
      ctaLabel: 'Close the month',
    });

    await this.notifications.upsert(userId, {
      dedupeKey: `monthly-update-investments-${key}`,
      period: NotificationPeriod.MONTHLY,
      category: NotificationCategory.WALLET,
      kind: NotificationKind.REMINDER,
      title: 'Update investments',
      body: 'Check your wallet prices and positions to keep your net worth up to date.',
      href: '/wallet-investments',
      ctaLabel: 'Update wallet',
    });
  }
}
