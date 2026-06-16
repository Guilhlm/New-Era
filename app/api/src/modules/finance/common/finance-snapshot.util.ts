import type { Prisma, PrismaClient } from '@prisma/client';

export const SNAPSHOT_KIND = {
  OPENING: 'OPENING',
  CLOSING: 'CLOSING',
} as const;

export type SnapshotKind = (typeof SNAPSHOT_KIND)[keyof typeof SNAPSHOT_KIND];

type SnapshotClient = Pick<PrismaClient, 'portfolioSnapshot'>;

function kindWhere(userId: string, date: Date, kind: SnapshotKind) {
  return {
    userId_date_kind: { userId, date, kind },
  } as Prisma.PortfolioSnapshotWhereUniqueInput;
}

export async function upsertPortfolioSnapshot(
  prisma: SnapshotClient,
  userId: string,
  date: Date,
  kind: SnapshotKind,
  totals: { totalBalance: number; investedTotal: number },
) {
  await prisma.portfolioSnapshot.upsert({
    where: kindWhere(userId, date, kind),
    create: {
      userId,
      date,
      kind,
      totalValue: totals.totalBalance,
      investedValue: totals.investedTotal,
    } as unknown as Prisma.PortfolioSnapshotCreateInput,
    update: {
      totalValue: totals.totalBalance,
      investedValue: totals.investedTotal,
    },
  });
}

export async function findPortfolioSnapshot(
  prisma: SnapshotClient,
  userId: string,
  date: Date,
  kind: SnapshotKind,
) {
  return prisma.portfolioSnapshot.findUnique({
    where: kindWhere(userId, date, kind),
  });
}

export async function realignOpeningSnapshotAfterPositionRemoval(
  prisma: SnapshotClient,
  userId: string,
  equityAfter: { totalBalance: number; investedTotal: number },
  equityDelta: { totalBalance: number; investedTotal: number },
) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const opening = await findPortfolioSnapshot(prisma, userId, today, SNAPSHOT_KIND.OPENING);
  if (!opening) return;

  const openingTotal = Number(opening.totalValue);
  const openingInvested = Number(opening.investedValue);

  const adjustedTotal = openingTotal - equityDelta.totalBalance;
  const adjustedInvested = openingInvested - equityDelta.investedTotal;

  await upsertPortfolioSnapshot(prisma, userId, today, SNAPSHOT_KIND.OPENING, {
    totalBalance: Math.max(equityAfter.totalBalance, adjustedTotal),
    investedTotal: Math.max(equityAfter.investedTotal, adjustedInvested),
  });
}

export async function createPortfolioSnapshotIfMissing(
  prisma: SnapshotClient,
  userId: string,
  date: Date,
  kind: SnapshotKind,
  totals: { totalBalance: number; investedTotal: number },
) {
  const existing = await findPortfolioSnapshot(prisma, userId, date, kind);
  if (existing) return existing;

  return prisma.portfolioSnapshot.create({
    data: {
      userId,
      date,
      kind,
      totalValue: totals.totalBalance,
      investedValue: totals.investedTotal,
    } as unknown as Prisma.PortfolioSnapshotCreateInput,
  });
}
