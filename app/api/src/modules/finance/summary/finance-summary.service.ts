import { Injectable } from '@nestjs/common';
import {
  InvestmentType,
  Prisma,
  TransactionType,
  WalletType,
} from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { SNAPSHOT_KIND } from '../common/finance-snapshot.util';
import {
  computeGain,
  toNumber,
} from '../common/investment-value.util';
import {
  FINANCE_TX_CATEGORY,
  signedTransactionAmount,
} from '../investment/dto/investment.dto';
import { PortfolioReadService, type LivePositionRow } from '../portfolio/portfolio-read.service';

const ALLOCATION_COLORS: Record<string, string> = {
  WALLET: 'var(--color-wallet-selic)',
  CRYPTO: 'var(--color-red)',
  STOCK: 'var(--color-wallet-usd)',
  ETF: '#7c5cbf',
  FIXED_INCOME: 'var(--color-wallet-selic)',
  REIT: 'var(--color-wallet-usd)',
  OTHER: 'var(--color-grey)',
};

const RECENT_TX_LIMIT = 10;

@Injectable()
export class FinanceSummaryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly portfolioRead: PortfolioReadService,
  ) {}

  async getSummary(userId: string, performancePeriod = '1W') {
    const [equity, positions, cash, transactions, snapshots] = await Promise.all([
      this.portfolioRead.equityUsdt(userId),
      this.portfolioRead.livePositions(userId),
      this.portfolioRead.primaryCashAvailable(userId),
      this.prisma.transaction.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: RECENT_TX_LIMIT,
        include: { fromWallet: true, toWallet: true },
      }),
      this.getPerformanceSnapshots(userId, performancePeriod),
    ]);

    await this.portfolioRead.ensureOpeningSnapshot(userId, equity);

    const wallets = await this.prisma.wallet.findMany({
      where: { userId },
      select: { id: true, balance: true, type: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
    const cashWallets = wallets.filter(
      (w) => w.type === WalletType.CASH || w.type === WalletType.BANK,
    );
    const walletCashTotal = cashWallets.reduce((sum, w) => sum + toNumber(w.balance), 0);

    const { totalBalance, investedTotal, walletTotal, costTotal } = equity;
    const walletCashAvailable = cash.balance;

    const { gainAmount: allTimeGainAmount, gainPct: allTimeGainPct } =
      this.portfolioRead.computeAllTimeGain(investedTotal, costTotal);

    const todayGainAmount = await this.portfolioRead.computeTodayPnl(userId, equity);
    const todayGainPct =
      totalBalance > 0 ? (todayGainAmount / totalBalance) * 100 : 0;

    const allocation = this.buildAllocation(positions, walletCashTotal, totalBalance);
    const portfolioInsight = this.buildPortfolioInsight(positions);
    const recentTransactions = transactions.map((tx) => this.mapTransaction(tx));
    const performance = this.buildPerformance(
      performancePeriod,
      snapshots,
      totalBalance,
      allTimeGainAmount,
      allTimeGainPct,
    );

    const investedPctOfTotal =
      totalBalance > 0 ? (investedTotal / totalBalance) * 100 : 0;
    const availablePctOfTotal =
      totalBalance > 0 ? (walletCashAvailable / totalBalance) * 100 : 0;

    return {
      totalBalance,
      walletCashAvailable,
      investedTotal,
      walletTotal,
      todayGainAmount,
      todayGainPct,
      allTimeGainAmount,
      allTimeGainPct,
      investedPctOfTotal,
      availablePctOfTotal,
      allocation,
      portfolioInsight,
      recentTransactions,
      performance,
      primaryWalletId: cash.walletId,
    };
  }

  async getPerformance(userId: string, period = '1W') {
    const [snapshots, equity] = await Promise.all([
      this.getPerformanceSnapshots(userId, period),
      this.portfolioRead.equityUsdt(userId),
    ]);

    const { totalBalance, investedTotal, costTotal } = equity;
    const { gainAmount, gainPct } = this.portfolioRead.computeAllTimeGain(
      investedTotal,
      costTotal,
    );

    return this.buildPerformance(period, snapshots, totalBalance, gainAmount, gainPct);
  }

  private async getPerformanceSnapshots(userId: string, period: string) {
    const days = this.periodToDays(period);
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - days);
    since.setUTCHours(0, 0, 0, 0);

    return this.prisma.portfolioSnapshot.findMany({
      where: {
        userId,
        kind: SNAPSHOT_KIND.CLOSING,
        date: { gte: since },
      } as Prisma.PortfolioSnapshotWhereInput,
      orderBy: { date: 'asc' },
    });
  }

  private periodToDays(period: string): number {
    switch (period) {
      case '1D':
        return 1;
      case '1W':
        return 7;
      case '1M':
        return 30;
      case '5M':
        return 150;
      case '1Y':
        return 365;
      default:
        return 7;
    }
  }

  private buildAllocation(
    investments: LivePositionRow[],
    walletCashTotal: number,
    totalBalance: number,
  ) {
    if (totalBalance <= 0) {
      return {
        centerPct: 0,
        centerCaption: 'USD',
        segments: [] as Array<{
          key: string;
          label: string;
          value: number;
          pct: number;
          color: string;
        }>,
      };
    }

    const entries: Array<{ key: string; label: string; value: number; color: string }> = [];

    if (walletCashTotal > 0) {
      entries.push({
        key: 'wallet',
        label: 'Carteira',
        value: walletCashTotal,
        color: ALLOCATION_COLORS.WALLET,
      });
    }

    const byTicker = new Map<string, { label: string; value: number; color: string }>();

    for (const inv of investments) {
      const key = inv.ticker || inv.type;
      const value = inv.currentValue;
      if (value <= 0) continue;
      const existing = byTicker.get(key);
      if (existing) {
        existing.value += value;
      } else {
        byTicker.set(key, {
          label: inv.ticker || inv.name,
          value,
          color: ALLOCATION_COLORS[inv.type] ?? ALLOCATION_COLORS.OTHER,
        });
      }
    }

    entries.push(
      ...Array.from(byTicker.entries()).map(([key, data]) => ({ key, ...data })),
    );

    const sorted = entries.sort((a, b) => b.value - a.value);

    const withPct = sorted.map((segment) => ({
      ...segment,
      pct: (segment.value / totalBalance) * 100,
    }));

    return {
      centerPct: withPct[0]?.pct ?? 0,
      centerCaption: 'USD',
      segments: withPct,
    };
  }

  private buildPortfolioInsight(investments: LivePositionRow[]) {
    if (investments.length === 0) {
      return {
        positionsCount: 0,
        winnersCount: 0,
        losersCount: 0,
        best: { ticker: '-', gainPct: 0 },
        worst: { ticker: '-', gainPct: 0 },
      };
    }

    const rows = investments.map((inv) => {
      const { gainPct } = computeGain(inv.currentValue, inv.costValue);
      return { ticker: inv.ticker || inv.name, gainPct };
    });

    const winnersCount = rows.filter((r) => r.gainPct > 0).length;
    const losersCount = rows.filter((r) => r.gainPct < 0).length;
    const sorted = [...rows].sort((a, b) => b.gainPct - a.gainPct);

    return {
      positionsCount: investments.length,
      winnersCount,
      losersCount,
      best: sorted[0] ?? { ticker: '-', gainPct: 0 },
      worst: sorted[sorted.length - 1] ?? { ticker: '-', gainPct: 0 },
    };
  }

  private mapTransaction(tx: {
    id: string;
    type: TransactionType;
    amount: unknown;
    description: string | null;
    category: string | null;
    date: Date;
  }) {
    const amount = signedTransactionAmount(tx.type, toNumber(tx.amount));
    const category = tx.category ?? '';
    let title = tx.description ?? 'Transaction';
    let subtitle = new Date(tx.date).toLocaleDateString('en-US');

    if (category === FINANCE_TX_CATEGORY.INVESTMENT_BUY) {
      title = tx.description?.startsWith('Buy ') ? tx.description : `Buy ${tx.description ?? ''}`.trim();
      subtitle = tx.description?.includes('•') ? tx.description.split('•').slice(1).join('•').trim() : subtitle;
    } else if (category === FINANCE_TX_CATEGORY.INVESTMENT_SELL) {
      title = tx.description?.startsWith('Sell ') ? tx.description : `Sell ${tx.description ?? ''}`.trim();
      subtitle = tx.description?.includes('•') ? tx.description.split('•').slice(1).join('•').trim() : subtitle;
    } else if (category === FINANCE_TX_CATEGORY.DIVIDEND) {
      title = 'Dividend';
      subtitle = tx.description ?? subtitle;
    } else if (category === FINANCE_TX_CATEGORY.DEPOSIT) {
      title = 'Deposit';
      subtitle = tx.description ?? 'Funds added';
    } else if (category === FINANCE_TX_CATEGORY.WITHDRAW) {
      title = 'Withdraw';
      subtitle = tx.description ?? 'Funds removed';
    } else if (category === FINANCE_TX_CATEGORY.POSITION_REGISTER) {
      title = 'Position registered';
      subtitle = tx.description?.includes('•')
        ? tx.description.split('•').slice(1).join('•').trim()
        : (tx.description ?? subtitle);
      return {
        id: tx.id,
        title,
        subtitle,
        amount: Math.abs(toNumber(tx.amount)),
      };
    }

    return { id: tx.id, title, subtitle, amount };
  }

  private buildPerformance(
    period: string,
    snapshots: Array<{ date: Date; totalValue: unknown }>,
    totalBalance: number,
    gainAmount: number,
    gainPct: number,
  ) {
    const points =
      snapshots.length > 0
        ? snapshots.map((snapshot) => ({
            label: new Date(snapshot.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            }),
            value: toNumber(snapshot.totalValue),
          }))
        : [{ label: 'Now', value: totalBalance }];

    return {
      period,
      gainAmount,
      gainPct,
      points,
    };
  }
}
