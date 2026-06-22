import { BadRequestException, Injectable } from '@nestjs/common';
import {
  InvestmentType,
  Prisma,
  TransactionType,
  WalletType,
} from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { SNAPSHOT_KIND } from '../common/finance-snapshot.util';
import {
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

/** Transações exibidas em Recent Transactions da wallet (exclui aportes em metas). */
const WALLET_RECENT_TX_CATEGORIES = [
  FINANCE_TX_CATEGORY.DEPOSIT,
  FINANCE_TX_CATEGORY.DEPOSIT_CARD,
  FINANCE_TX_CATEGORY.DEPOSIT_CASH,
  FINANCE_TX_CATEGORY.DEPOSIT_SALARY,
  FINANCE_TX_CATEGORY.DEPOSIT_EXTRA_INCOME,
  FINANCE_TX_CATEGORY.WITHDRAW,
  FINANCE_TX_CATEGORY.CARD_INVOICE_PAYMENT,
  FINANCE_TX_CATEGORY.INVESTMENT_BUY,
  FINANCE_TX_CATEGORY.INVESTMENT_SELL,
  FINANCE_TX_CATEGORY.POSITION_REGISTER,
  FINANCE_TX_CATEGORY.DIVIDEND,
] as const;

@Injectable()
export class FinanceSummaryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly portfolioRead: PortfolioReadService,
  ) {}

  private async assertMonthlyIncomeConfigured(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { monthlyIncome: true },
    });
    if (Number(user?.monthlyIncome ?? 0) <= 0) {
      throw new BadRequestException('Set your monthly salary to use the finance area.');
    }
  }

  async getSummary(userId: string, performancePeriod = '1W') {
    await this.assertMonthlyIncomeConfigured(userId);
    const [positions, cash, transactions, monthlyExpenses, snapshots] = await Promise.all([
      this.portfolioRead.livePositions(userId),
      this.portfolioRead.primaryCashAvailable(userId),
      this.prisma.transaction.findMany({
        where: {
          userId,
          category: { in: [...WALLET_RECENT_TX_CATEGORIES] },
        },
        orderBy: { date: 'desc' },
        take: RECENT_TX_LIMIT,
        include: { fromWallet: true, toWallet: true },
      }),
      this.prisma.monthlyExpense.findMany({
        where: {
          userId,
          transactionId: null,
          status: 'paid',
        },
        orderBy: { createdAt: 'desc' },
        take: RECENT_TX_LIMIT,
        include: { categoryRef: true },
      }),
      this.getPerformanceSnapshots(userId, performancePeriod),
    ]);

    const equity = await this.portfolioRead.equityFromPositions(userId, positions);

    await this.portfolioRead.ensureOpeningSnapshot(userId, equity);
    await this.portfolioRead.ensureClosingSnapshot(userId, equity);

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
    const recentTransactions = [
      ...transactions.map((tx) => ({
        ...this.mapTransaction(tx),
        date: tx.date,
      })),
      ...monthlyExpenses.map((expense) => ({
        ...this.mapMonthlyExpense(expense),
        date: expense.createdAt,
      })),
    ]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, RECENT_TX_LIMIT)
      .map(({ date: _date, ...item }) => item);
    const performance = this.buildPerformance(performancePeriod, snapshots, totalBalance);

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
    await this.assertMonthlyIncomeConfigured(userId);
    const [snapshots, equity] = await Promise.all([
      this.getPerformanceSnapshots(userId, period),
      this.portfolioRead.equityUsdt(userId),
    ]);

    const { totalBalance } = equity;
    await this.portfolioRead.ensureClosingSnapshot(userId, equity);

    return this.buildPerformance(period, snapshots, totalBalance);
  }

  private async getPerformanceSnapshots(userId: string, period: string) {
    const days = Math.max(this.periodToDays(period), 2);
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

    const rows = investments.map((inv) => ({
      ticker: inv.ticker || inv.name,
      gainPct: inv.changePct24h,
    }));

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
    } else if (
      category === FINANCE_TX_CATEGORY.DEPOSIT ||
      category === FINANCE_TX_CATEGORY.DEPOSIT_CARD ||
      category === FINANCE_TX_CATEGORY.DEPOSIT_CASH ||
      category === FINANCE_TX_CATEGORY.DEPOSIT_SALARY ||
      category === FINANCE_TX_CATEGORY.DEPOSIT_EXTRA_INCOME
    ) {
      title = 'Deposit';
      subtitle = tx.description ?? 'Funds added';
    } else if (category === FINANCE_TX_CATEGORY.WITHDRAW) {
      title = 'Withdraw';
      subtitle = tx.description ?? 'Funds removed';
    } else if (category === FINANCE_TX_CATEGORY.FINANCIAL_GOAL_CONTRIBUTION) {
      title = 'Goal contribution';
      subtitle = tx.description ?? 'Funds allocated to a goal';
    } else if (category === FINANCE_TX_CATEGORY.CARD_INVOICE_PAYMENT) {
      title = 'Card invoice payment';
      subtitle = tx.description ?? 'Invoice paid';
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

  private mapMonthlyExpense(expense: {
    id: string;
    title: string;
    amount: unknown;
    category: string | null;
    source: string;
    createdAt: Date;
    categoryRef: { name: string } | null;
  }) {
    const subtitleParts = [
      expense.categoryRef?.name ?? expense.category ?? 'Uncategorized',
      expense.source === 'CASH' ? 'Cash' : expense.source,
    ];
    return {
      id: `monthly-${expense.id}`,
      title: expense.title,
      subtitle: subtitleParts.filter(Boolean).join(' • '),
      amount: -Math.abs(toNumber(expense.amount)),
      currency: 'BRL',
      alreadyConverted: true,
    };
  }

  private startOfUtcDay(date = new Date()): Date {
    const day = new Date(date);
    day.setUTCHours(0, 0, 0, 0);
    return day;
  }

  private dayKey(date: Date): string {
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
  }

  private buildDailyPerformancePoints(
    days: number,
    snapshots: Array<{ date: Date; totalValue: unknown }>,
    currentBalance: number,
  ) {
    const effectiveDays = Math.max(days, 2);
    const end = this.startOfUtcDay();
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - (effectiveDays - 1));

    const byDay = new Map<string, number>();
    for (const snapshot of snapshots) {
      byDay.set(this.dayKey(snapshot.date), toNumber(snapshot.totalValue));
    }

    const points: Array<{ label: string; value: number }> = [];
    let lastKnown = 0;
    const cursor = new Date(start);

    while (cursor.getTime() <= end.getTime()) {
      const key = this.dayKey(cursor);
      if (byDay.has(key)) {
        lastKnown = byDay.get(key)!;
      }
      const isLast = cursor.getTime() === end.getTime();
      points.push({
        label: cursor.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          timeZone: 'UTC',
        }),
        value: isLast ? currentBalance : lastKnown,
      });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return points;
  }

  private buildPerformance(
    period: string,
    snapshots: Array<{ date: Date; totalValue: unknown }>,
    totalBalance: number,
  ) {
    const days = this.periodToDays(period);
    const points = this.buildDailyPerformancePoints(days, snapshots, totalBalance);
    const firstValue = points[0]?.value ?? 0;
    const lastValue = points[points.length - 1]?.value ?? totalBalance;
    const gainAmount = lastValue - firstValue;
    const gainPct =
      firstValue > 0 ? (gainAmount / firstValue) * 100 : lastValue > 0 ? 100 : 0;

    return {
      period,
      gainAmount: Number(gainAmount.toFixed(2)),
      gainPct: Number(gainPct.toFixed(1)),
      points,
    };
  }
}
