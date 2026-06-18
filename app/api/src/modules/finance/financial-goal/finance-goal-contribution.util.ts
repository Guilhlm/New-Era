import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import {
  assertResourceExists,
  assertResourceOwner,
} from '../../../common/auth/ownership.util';
import { FINANCE_TX_CATEGORY } from '../investment/dto/investment.dto';

const REVERSIBLE_ACTIVITY_SOURCE = 'MANUAL_ADD';

async function findLinkedTransactionId(
  client: Prisma.TransactionClient,
  userId: string,
  activity: {
    id: string;
    goalId: string;
    amount: unknown;
    transactionId: string | null;
    createdAt: Date;
  },
  goalTitle: string,
) {
  if (activity.transactionId) return activity.transactionId;

  const amount = Number(activity.amount ?? 0);
  const windowStart = new Date(activity.createdAt.getTime() - 60_000);
  const windowEnd = new Date(activity.createdAt.getTime() + 60_000);

  const legacy = await client.transaction.findFirst({
    where: {
      userId,
      category: FINANCE_TX_CATEGORY.FINANCIAL_GOAL_CONTRIBUTION,
      amount,
      description: { contains: goalTitle },
      date: { gte: windowStart, lte: windowEnd },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (legacy) {
    await client.financialGoalActivity.update({
      where: { id: activity.id },
      data: { transactionId: legacy.id },
    });
    return legacy.id;
  }

  return null;
}

export async function reverseGoalContribution(
  prisma: Prisma.TransactionClient,
  userId: string,
  input: { activityId: string; goalId: string },
) {
  const activity = await prisma.financialGoalActivity.findUnique({
    where: { id: input.activityId },
  });
  const found = assertResourceExists(activity, 'Goal activity');
  assertResourceOwner(found.userId, userId, 'Goal activity');

  if (found.goalId !== input.goalId) {
    throw new NotFoundException('Goal activity not found.');
  }
  if (found.source !== REVERSIBLE_ACTIVITY_SOURCE) {
    throw new BadRequestException('Only contributions can be deleted.');
  }

  const goal = await prisma.financialGoal.findUnique({ where: { id: input.goalId } });
  const existingGoal = assertResourceExists(goal, 'Financial goal');
  assertResourceOwner(existingGoal.userId, userId, 'Financial goal');

  const transactionId = await findLinkedTransactionId(
    prisma,
    userId,
    found,
    existingGoal.title,
  );

  await prisma.financialGoal.update({
    where: { id: input.goalId },
    data: {
      currentAmount: Math.max(0, Number(existingGoal.currentAmount) - Number(found.amount)),
    },
  });

  if (transactionId) {
    await prisma.transaction.delete({ where: { id: transactionId } });
  }

  await prisma.financialGoalActivity.delete({ where: { id: found.id } });
}

export async function reverseGoalContributionByTransaction(
  prisma: Prisma.TransactionClient,
  userId: string,
  transactionId: string,
) {
  const transaction = await prisma.transaction.findUnique({ where: { id: transactionId } });
  const existingTx = assertResourceExists(transaction, 'Transaction');
  assertResourceOwner(existingTx.userId, userId, 'Transaction');

  if (existingTx.category !== FINANCE_TX_CATEGORY.FINANCIAL_GOAL_CONTRIBUTION) {
    throw new BadRequestException('Transaction is not a goal contribution.');
  }

  const linkedActivity = await prisma.financialGoalActivity.findFirst({
    where: { userId, transactionId },
  });

  if (linkedActivity) {
    await reverseGoalContribution(prisma, userId, {
      activityId: linkedActivity.id,
      goalId: linkedActivity.goalId,
    });
    return;
  }

  const goalTitle = existingTx.description?.split('•').pop()?.trim();
  if (goalTitle) {
    const goal = await prisma.financialGoal.findFirst({
      where: { userId, title: goalTitle, isSystem: false },
    });

    if (goal) {
      const legacyActivity = await prisma.financialGoalActivity.findFirst({
        where: {
          userId,
          goalId: goal.id,
          source: REVERSIBLE_ACTIVITY_SOURCE,
          amount: existingTx.displayAmount ?? existingTx.amount,
          createdAt: {
            gte: new Date(existingTx.date.getTime() - 60_000),
            lte: new Date(existingTx.date.getTime() + 60_000),
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (legacyActivity) {
        await reverseGoalContribution(prisma, userId, {
          activityId: legacyActivity.id,
          goalId: legacyActivity.goalId,
        });
        return;
      }
    }
  }

  await prisma.transaction.delete({ where: { id: transactionId } });
}
