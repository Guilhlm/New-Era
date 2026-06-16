import type { PrismaClient } from '@prisma/client';
import { WalletType } from '@prisma/client';
import { MIN_ACTIVE_POSITION_SHARES, toNumber } from '../common/investment-value.util';
import {
  SNAPSHOT_KIND,
  upsertPortfolioSnapshot,
} from '../common/finance-snapshot.util';

export async function getOrCreatePrimaryCashWallet(
  prisma: PrismaClient,
  userId: string,
) {
  const existing = await prisma.wallet.findFirst({
    where: { userId, type: { in: [WalletType.CASH, WalletType.BANK] } },
    orderBy: { createdAt: 'asc' },
  });

  if (existing) return existing;

  return prisma.wallet.create({
    data: {
      userId,
      name: 'Available Cash',
      type: WalletType.CASH,
      balance: 0,
    },
  });
}

export async function syncUserTotalBalance(prisma: PrismaClient, userId: string) {
  const [walletAgg, investmentAgg] = await Promise.all([
    prisma.wallet.aggregate({
      where: { userId },
      _sum: { balance: true },
    }),
    prisma.investment.aggregate({
      where: { userId, shares: { gt: MIN_ACTIVE_POSITION_SHARES } },
      _sum: { currentValue: true },
    }),
  ]);

  const walletTotal = toNumber(walletAgg._sum.balance);
  const investedTotal = toNumber(investmentAgg._sum.currentValue);
  const totalBalance = walletTotal + investedTotal;

  await prisma.user.update({
    where: { id: userId },
    data: { totalBalance },
  });

  return { totalBalance, walletTotal, investedTotal };
}

export async function upsertTodayPortfolioSnapshot(
  prisma: PrismaClient,
  userId: string,
  totals: { totalBalance: number; investedTotal: number },
) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  await upsertPortfolioSnapshot(prisma, userId, today, SNAPSHOT_KIND.CLOSING, {
    totalBalance: totals.totalBalance,
    investedTotal: totals.investedTotal,
  });
}

export async function syncUserFinanceState(prisma: PrismaClient, userId: string) {
  const totals = await syncUserTotalBalance(prisma, userId);
  await upsertTodayPortfolioSnapshot(prisma, userId, {
    totalBalance: totals.totalBalance,
    investedTotal: totals.investedTotal,
  });
  return totals;
}
