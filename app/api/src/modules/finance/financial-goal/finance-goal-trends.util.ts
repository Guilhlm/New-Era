import type { Prisma } from '@prisma/client';
import type { PrismaService } from '../../../prisma/prisma.service';
import { FINANCE_TX_CATEGORY } from '../investment/dto/investment.dto';

function pctChange(current: number, previous: number) {
  if (previous <= 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function txAmountSum(
  aggregate: { _sum: { displayAmount: Prisma.Decimal | null; amount: Prisma.Decimal | null } },
) {
  return Number(aggregate._sum.displayAmount ?? aggregate._sum.amount ?? 0);
}

export async function computeFinancialGoalTrends(
  prisma: Pick<PrismaService, 'transaction' | 'financialGoalActivity'>,
  userId: string,
  goals: Array<{ id: string; targetAmount: unknown; currentAmount: unknown }>,
) {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  const [thisMonthContributionsAgg, lastMonthContributionsAgg] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        userId,
        category: FINANCE_TX_CATEGORY.FINANCIAL_GOAL_CONTRIBUTION,
        date: { gte: thisMonthStart },
      },
      _sum: { displayAmount: true, amount: true },
    }),
    prisma.transaction.aggregate({
      where: {
        userId,
        category: FINANCE_TX_CATEGORY.FINANCIAL_GOAL_CONTRIBUTION,
        date: { gte: lastMonthStart, lte: lastMonthEnd },
      },
      _sum: { displayAmount: true, amount: true },
    }),
  ]);

  const thisMonthContributions = txAmountSum(thisMonthContributionsAgg);
  const lastMonthContributions = txAmountSum(lastMonthContributionsAgg);
  const savedTrend = pctChange(thisMonthContributions, lastMonthContributions);

  const totalTarget = goals.reduce((sum, goal) => sum + Number(goal.targetAmount ?? 0), 0);
  const totalSaved = goals.reduce((sum, goal) => sum + Number(goal.currentAmount ?? 0), 0);
  const avgProgressNow = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  const goalIds = goals.map((goal) => goal.id);
  const thisMonthActivities =
    goalIds.length > 0
      ? await prisma.financialGoalActivity.findMany({
          where: {
            userId,
            source: 'MANUAL_ADD',
            goalId: { in: goalIds },
            createdAt: { gte: thisMonthStart },
          },
          select: { goalId: true, amount: true },
        })
      : [];

  const contributedThisMonthByGoal = new Map<string, number>();
  for (const activity of thisMonthActivities) {
    contributedThisMonthByGoal.set(
      activity.goalId,
      (contributedThisMonthByGoal.get(activity.goalId) ?? 0) + Number(activity.amount),
    );
  }

  const savedAtLastMonthEnd = goals.reduce((sum, goal) => {
    const contributed = contributedThisMonthByGoal.get(goal.id) ?? 0;
    return sum + Math.max(0, Number(goal.currentAmount ?? 0) - contributed);
  }, 0);

  const avgProgressLastMonth =
    totalTarget > 0 ? (savedAtLastMonthEnd / totalTarget) * 100 : 0;
  const progressTrend = avgProgressNow - avgProgressLastMonth;

  return {
    saved: Math.round(savedTrend * 10) / 10,
    progress: Math.round(progressTrend * 10) / 10,
  };
}
