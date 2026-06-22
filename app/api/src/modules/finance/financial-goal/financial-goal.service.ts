import { BadRequestException, Injectable } from '@nestjs/common';
import {
  NotificationCategory,
  NotificationKind,
  NotificationPeriod,
  TransactionType,
} from '@prisma/client';
import {
  assertResourceExists,
  assertResourceOwner,
} from '../../../common/auth/ownership.util';
import { PrismaService } from '../../../prisma/prisma.service';
import { NotificationService } from '../../notification/notification.service';
import { decimalUsdt } from '../common/money.util';
import { FINANCE_TX_CATEGORY } from '../investment/dto/investment.dto';
import {
  reverseGoalContribution,
} from './finance-goal-contribution.util';
import { computeFinancialGoalTrends } from './finance-goal-trends.util';
import type {
  CreateFinancialGoalDto,
  FinancialGoalQueryDto,
  UpdateFinancialGoalDto,
  UpdateFinancialGoalProgressDto,
} from './dto/financial-goal.dto';

@Injectable()
export class FinancialGoalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationService,
  ) {}

  private async notifyGoalReached(
    userId: string,
    goal: { id: string; title: string; targetAmount: unknown },
  ) {
    await this.notifications.emit(userId, {
      dedupeKey: `goal-reached-${goal.id}`,
      period: NotificationPeriod.MONTHLY,
      category: NotificationCategory.GOALS,
      kind: NotificationKind.UPDATE,
      title: 'Goal reached!',
      body: `You reached the "${goal.title}" goal. Congratulations on the achievement!`,
      href: '/finance-goals',
      ctaLabel: 'View goals',
      metadata: { goalId: goal.id, target: Number(goal.targetAmount) },
    });
  }

  private async assertMonthlyIncomeConfigured(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { monthlyIncome: true },
    });
    if (Number(user?.monthlyIncome ?? 0) <= 0) {
      throw new BadRequestException('Set your monthly salary to use the finance area.');
    }
  }

  private async findGoalOrThrow(id: string, userId: string) {
    const found = await this.prisma.financialGoal.findUnique({ where: { id } });
    const goal = assertResourceExists(found, 'Financial goal');
    assertResourceOwner(goal.userId, userId, 'Financial goal');
    return goal;
  }

  private parseDeadline(deadline?: string) {
    if (!deadline) return null;
    const parsed = new Date(deadline);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException('Invalid deadline. Use ISO date format.');
    }
    return parsed;
  }

  private sortGoals<T extends { title: string; deadline: Date | null; targetAmount: unknown }>(
    goals: T[],
    sort: FinancialGoalQueryDto['sort'],
  ) {
    if (!sort || sort === 'progress') {
      return [...goals].sort((a, b) => {
        const aTarget = Number((a as { targetAmount: unknown }).targetAmount ?? 0);
        const bTarget = Number((b as { targetAmount: unknown }).targetAmount ?? 0);
        const aCurrent = Number((a as { currentAmount?: unknown }).currentAmount ?? 0);
        const bCurrent = Number((b as { currentAmount?: unknown }).currentAmount ?? 0);
        const aPercent = aTarget > 0 ? aCurrent / aTarget : 0;
        const bPercent = bTarget > 0 ? bCurrent / bTarget : 0;
        return bPercent - aPercent;
      });
    }
    if (sort === 'name') {
      return [...goals].sort((a, b) => a.title.localeCompare(b.title, 'en-US'));
    }
    if (sort === 'deadline') {
      return [...goals].sort((a, b) => {
        const aTime = a.deadline?.getTime() ?? Number.MAX_SAFE_INTEGER;
        const bTime = b.deadline?.getTime() ?? Number.MAX_SAFE_INTEGER;
        return aTime - bTime;
      });
    }
    if (sort === 'target') {
      return [...goals].sort(
        (a, b) =>
          Number((b as { targetAmount: unknown }).targetAmount ?? 0) -
          Number((a as { targetAmount: unknown }).targetAmount ?? 0),
      );
    }
    return goals;
  }

  async list(userId: string, query: FinancialGoalQueryDto) {
    await this.assertMonthlyIncomeConfigured(userId);
    const goals = await this.prisma.financialGoal.findMany({
      where: { userId, isSystem: false },
      include: {
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 3,
        },
      },
    });

    const sorted = this.sortGoals(goals, query.sort);
    const trends = await computeFinancialGoalTrends(this.prisma, userId, sorted);

    return {
      goals: sorted.map((goal) => ({
        id: goal.id,
        title: goal.title,
        description: goal.description ?? '',
        targetAmount: Number(goal.targetAmount),
        currentAmount: Number(goal.currentAmount),
        deadline: goal.deadline?.toISOString() ?? null,
        isSystem: goal.isSystem,
        isLocked: goal.isLocked,
        systemKey: goal.systemKey,
        activities: goal.activities.map((activity) => ({
          id: activity.id,
          label: activity.label,
          amount: Number(activity.amount),
          date: activity.createdAt.toISOString(),
          source: activity.source,
          canDelete: activity.source === 'MANUAL_ADD',
        })),
      })),
      trends,
    };
  }

  async create(userId: string, data: CreateFinancialGoalDto) {
    await this.assertMonthlyIncomeConfigured(userId);
    return this.prisma.financialGoal.create({
      data: {
        userId,
        title: data.title.trim(),
        description: data.description?.trim() ?? null,
        targetAmount: data.targetAmount,
        currentAmount: data.currentAmount ?? 0,
        deadline: this.parseDeadline(data.deadline),
        isSystem: false,
        isLocked: false,
      },
    });
  }

  async update(id: string, userId: string, data: UpdateFinancialGoalDto) {
    await this.assertMonthlyIncomeConfigured(userId);
    const existing = await this.findGoalOrThrow(id, userId);
    if (existing.isLocked || existing.isSystem) {
      if (data.title !== undefined && data.title.trim() !== existing.title) {
        throw new BadRequestException('System goals cannot be renamed.');
      }
      return this.prisma.financialGoal.update({
        where: { id },
        data: {
          ...(data.description !== undefined
            ? { description: data.description.trim() }
            : {}),
          ...(data.targetAmount !== undefined ? { targetAmount: data.targetAmount } : {}),
          ...(data.deadline !== undefined
            ? { deadline: this.parseDeadline(data.deadline) }
            : {}),
        },
      });
    }
    return this.prisma.financialGoal.update({
      where: { id },
      data: {
        ...(data.title !== undefined ? { title: data.title.trim() } : {}),
        ...(data.description !== undefined
          ? { description: data.description.trim() }
          : {}),
        ...(data.targetAmount !== undefined ? { targetAmount: data.targetAmount } : {}),
        ...(data.currentAmount !== undefined
          ? { currentAmount: data.currentAmount }
          : {}),
        ...(data.deadline !== undefined
          ? { deadline: this.parseDeadline(data.deadline) }
          : {}),
      },
    });
  }

  async updateProgress(
    id: string,
    userId: string,
    data: UpdateFinancialGoalProgressDto,
  ) {
    await this.assertMonthlyIncomeConfigured(userId);
    const existing = await this.findGoalOrThrow(id, userId);
    const mode = data.mode ?? 'set';
    if (mode === 'add' && (existing.isLocked || existing.isSystem)) {
      throw new BadRequestException(
        'Automatic goals are updated by their corresponding financial transactions.',
      );
    }
    const nextAmount =
      mode === 'add'
        ? Number(existing.currentAmount) + data.amount
        : data.amount;

    const label = data.label?.trim() || (mode === 'add' ? 'Contribution' : 'Progress adjustment');

    const target = Number(existing.targetAmount);
    const justReached =
      target > 0 &&
      Number(existing.currentAmount) < target &&
      Math.max(0, nextAmount) >= target;

    const result = await this.prisma.$transaction(async (tx) => {
      const goal = await tx.financialGoal.update({
        where: { id },
        data: { currentAmount: Math.max(0, nextAmount) },
      });

      if (mode === 'add') {
        const transaction = await tx.transaction.create({
          data: {
            userId,
            type: TransactionType.EXPENSE,
            amount: decimalUsdt(data.amount),
            displayAmount: decimalUsdt(data.amount),
            displayCurrency: 'BRL',
            description: `${label} • ${existing.title}`,
            category: FINANCE_TX_CATEGORY.FINANCIAL_GOAL_CONTRIBUTION,
            date: new Date(),
          },
        });

        await tx.financialGoalActivity.create({
          data: {
            goalId: id,
            userId,
            label,
            amount: data.amount,
            source: 'MANUAL_ADD',
            transactionId: transaction.id,
          },
        });

        return goal;
      }

      await tx.financialGoalActivity.create({
        data: {
          goalId: id,
          userId,
          label,
          amount: data.amount,
          source: 'MANUAL_SET',
        },
      });

      return goal;
    });

    if (justReached) {
      await this.notifyGoalReached(userId, existing);
    }

    return result;
  }

  async removeActivity(goalId: string, activityId: string, userId: string) {
    await this.assertMonthlyIncomeConfigured(userId);
    await this.prisma.$transaction(async (tx) => {
      await reverseGoalContribution(tx, userId, { goalId, activityId });
    });
    return { ok: true };
  }

  async complete(id: string, userId: string) {
    await this.assertMonthlyIncomeConfigured(userId);
    const existing = await this.findGoalOrThrow(id, userId);
    const updated = await this.prisma.financialGoal.update({
      where: { id },
      data: { currentAmount: existing.targetAmount },
    });

    await this.prisma.financialGoalActivity.create({
      data: {
        goalId: id,
        userId,
        label: 'Goal completed',
        amount: Number(existing.targetAmount),
        source: 'COMPLETED',
      },
    });

    await this.notifyGoalReached(userId, existing);
    return updated;
  }

  async remove(id: string, userId: string) {
    await this.assertMonthlyIncomeConfigured(userId);
    const existing = await this.findGoalOrThrow(id, userId);
    if (existing.isLocked || existing.isSystem) {
      throw new BadRequestException('System goals cannot be removed.');
    }

    await this.prisma.$transaction(async (tx) => {
      const activities = await tx.financialGoalActivity.findMany({
        where: { goalId: id },
        select: { transactionId: true },
      });
      const transactionIds = activities
        .map((activity) => activity.transactionId)
        .filter((value): value is string => Boolean(value));

      if (transactionIds.length > 0) {
        await tx.transaction.deleteMany({
          where: { userId, id: { in: transactionIds } },
        });
      }

      await tx.financialGoal.delete({ where: { id } });
    });

    return { ok: true };
  }
}
