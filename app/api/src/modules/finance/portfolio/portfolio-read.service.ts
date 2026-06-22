import { Injectable } from '@nestjs/common';
import {
  InvestmentLastAction,
  InvestmentType,
  WalletType,
} from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { getOrCreatePrimaryCashWallet } from '../common/finance-balance.util';
import {
  createPortfolioSnapshotIfMissing,
  findPortfolioSnapshot,
  SNAPSHOT_KIND,
  upsertPortfolioSnapshot,
} from '../common/finance-snapshot.util';
import { computeGain, isActivePosition, toNumber } from '../common/investment-value.util';
import { FINANCE_TX_CATEGORY } from '../investment/dto/investment.dto';
import { MarketProviders } from '../market/market.providers';

export type EquitySnapshot = {
  walletTotal: number;
  investedTotal: number;
  totalBalance: number;
  costTotal: number;
};

export type LivePositionRow = {
  id: string;
  ticker: string;
  name: string;
  type: InvestmentType;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  currentValue: number;
  costValue: number;
  changePct24h: number;
  lastAction: InvestmentLastAction;
};

@Injectable()
export class PortfolioReadService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly marketProviders: MarketProviders,
  ) {}

  private startOfUtcDay(date = new Date()): Date {
    const day = new Date(date);
    day.setUTCHours(0, 0, 0, 0);
    return day;
  }

  async livePositions(userId: string): Promise<LivePositionRow[]> {
    const investments = (
      await this.prisma.investment.findMany({
        where: { userId },
        orderBy: { currentValue: 'desc' },
      })
    ).filter((inv) => isActivePosition(toNumber(inv.shares)));

    const quoteEntries = await Promise.all(
      investments.map(async (inv) => {
        const ticker = inv.ticker.toUpperCase();
        const quote = await this.marketProviders.fetchQuoteForTicker(ticker);
        return [ticker, quote] as const;
      }),
    );
    const liveQuotes = new Map(quoteEntries);

    return investments.map((inv) => {
      const shares = toNumber(inv.shares);
      const storedPrice = toNumber(inv.currentPrice);
      const quote = liveQuotes.get(inv.ticker.toUpperCase());
      const livePrice = quote?.priceUsdt ?? 0;
      const currentPrice = livePrice > 0 ? livePrice : storedPrice;
      const costValue = toNumber(inv.costValue);

      return {
        id: inv.id,
        ticker: inv.ticker,
        name: inv.name,
        type: inv.type,
        shares,
        avgPrice: toNumber(inv.avgPrice),
        currentPrice,
        currentValue: shares * currentPrice,
        costValue,
        changePct24h: quote?.changePct24h ?? 0,
        lastAction: inv.lastAction,
      };
    });
  }

  async equityUsdt(userId: string): Promise<EquitySnapshot> {
    const positions = await this.livePositions(userId);
    return this.equityFromPositions(userId, positions);
  }

  /**
   * Derives the equity snapshot from already-loaded positions, avoiding a second
   * `livePositions` round-trip (DB + external quotes) when the caller already has them.
   */
  async equityFromPositions(
    userId: string,
    positions: LivePositionRow[],
  ): Promise<EquitySnapshot> {
    const wallets = await this.prisma.wallet.findMany({
      where: { userId },
      select: { balance: true },
    });

    const walletTotal = wallets.reduce((sum, w) => sum + toNumber(w.balance), 0);
    const investedTotal = positions.reduce((sum, p) => sum + p.currentValue, 0);
    const costTotal = positions.reduce((sum, p) => sum + p.costValue, 0);

    return {
      walletTotal,
      investedTotal,
      totalBalance: walletTotal + investedTotal,
      costTotal,
    };
  }

  async ensureOpeningSnapshot(userId: string, _equity: EquitySnapshot): Promise<void> {
    const today = this.startOfUtcDay();
    const existing = await findPortfolioSnapshot(
      this.prisma,
      userId,
      today,
      SNAPSHOT_KIND.OPENING,
    );
    if (existing) return;

    const yesterday = new Date(today);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const previousClosing = await findPortfolioSnapshot(
      this.prisma,
      userId,
      yesterday,
      SNAPSHOT_KIND.CLOSING,
    );

    const openingTotals = previousClosing
      ? {
          totalBalance: toNumber(previousClosing.totalValue),
          investedTotal: toNumber(previousClosing.investedValue),
        }
      : { totalBalance: 0, investedTotal: 0 };

    await createPortfolioSnapshotIfMissing(
      this.prisma,
      userId,
      today,
      SNAPSHOT_KIND.OPENING,
      openingTotals,
    );
  }

  async ensureClosingSnapshot(userId: string, equity: EquitySnapshot): Promise<void> {
    const today = this.startOfUtcDay();
    await upsertPortfolioSnapshot(this.prisma, userId, today, SNAPSHOT_KIND.CLOSING, {
      totalBalance: equity.totalBalance,
      investedTotal: equity.investedTotal,
    });
  }

  async computeTodayPnl(userId: string, equity: EquitySnapshot): Promise<number> {
    const today = this.startOfUtcDay();
    const equityNow = equity.totalBalance;

    const [openingSnapshot, todayFlows] = await Promise.all([
      findPortfolioSnapshot(this.prisma, userId, today, SNAPSHOT_KIND.OPENING),
      this.prisma.transaction.findMany({
        where: {
          userId,
          date: { gte: today },
          category: {
            in: [
              FINANCE_TX_CATEGORY.DEPOSIT,
              FINANCE_TX_CATEGORY.DEPOSIT_CARD,
              FINANCE_TX_CATEGORY.DEPOSIT_CASH,
              FINANCE_TX_CATEGORY.DEPOSIT_SALARY,
              FINANCE_TX_CATEGORY.DEPOSIT_EXTRA_INCOME,
              FINANCE_TX_CATEGORY.WITHDRAW,
              FINANCE_TX_CATEGORY.POSITION_REGISTER,
            ],
          },
        },
        select: { category: true, amount: true },
      }),
    ]);

    let startOfDayBalance = openingSnapshot
      ? toNumber(openingSnapshot.totalValue)
      : equityNow;

    if (openingSnapshot) {
      const openingInvested = toNumber(openingSnapshot.investedValue);
      const hasStaleOpeningBaseline =
        openingInvested > equity.investedTotal + 0.01 &&
        startOfDayBalance > equityNow + 0.01;

      if (hasStaleOpeningBaseline) {
        startOfDayBalance = equityNow;
        await upsertPortfolioSnapshot(this.prisma, userId, today, SNAPSHOT_KIND.OPENING, {
          totalBalance: equityNow,
          investedTotal: equity.investedTotal,
        });
      } else if (Math.abs(startOfDayBalance - equityNow) < 0.01) {
        const yesterday = new Date(today);
        yesterday.setUTCDate(yesterday.getUTCDate() - 1);
        const previousClosing = await findPortfolioSnapshot(
          this.prisma,
          userId,
          yesterday,
          SNAPSHOT_KIND.CLOSING,
        );

        if (previousClosing) {
          const previousClosingBalance = toNumber(previousClosing.totalValue);
          if (Math.abs(previousClosingBalance - equityNow) > 0.01) {
            startOfDayBalance = previousClosingBalance;
            await upsertPortfolioSnapshot(this.prisma, userId, today, SNAPSHOT_KIND.OPENING, {
              totalBalance: previousClosingBalance,
              investedTotal: toNumber(previousClosing.investedValue),
            });
          }
        } else if (startOfDayBalance > 0.01) {
          startOfDayBalance = 0;
          await upsertPortfolioSnapshot(this.prisma, userId, today, SNAPSHOT_KIND.OPENING, {
            totalBalance: 0,
            investedTotal: 0,
          });
        }
      }
    }

    let netDeposits = 0;
    let netWithdrawals = 0;
    let netPositionRegisters = 0;
    for (const tx of todayFlows) {
      const amount = toNumber(tx.amount);
      if (
        tx.category === FINANCE_TX_CATEGORY.DEPOSIT ||
        tx.category === FINANCE_TX_CATEGORY.DEPOSIT_CARD ||
        tx.category === FINANCE_TX_CATEGORY.DEPOSIT_CASH ||
        tx.category === FINANCE_TX_CATEGORY.DEPOSIT_SALARY ||
        tx.category === FINANCE_TX_CATEGORY.DEPOSIT_EXTRA_INCOME
      ) {
        netDeposits += amount;
      } else if (tx.category === FINANCE_TX_CATEGORY.WITHDRAW) {
        netWithdrawals += amount;
      } else if (tx.category === FINANCE_TX_CATEGORY.POSITION_REGISTER) {
        netPositionRegisters += amount;
      }
    }

    return equityNow - startOfDayBalance - netDeposits + netWithdrawals - netPositionRegisters;
  }

  async primaryCashAvailable(userId: string): Promise<{ walletId: string | null; balance: number }> {
    await getOrCreatePrimaryCashWallet(this.prisma, userId);
    const wallet = await this.prisma.wallet.findFirst({
      where: { userId, type: { in: [WalletType.CASH, WalletType.BANK] } },
      orderBy: { createdAt: 'asc' },
      select: { id: true, balance: true },
    });
    return {
      walletId: wallet?.id ?? null,
      balance: wallet ? toNumber(wallet.balance) : 0,
    };
  }

  computeAllTimeGain(investedTotal: number, costTotal: number) {
    return computeGain(investedTotal, costTotal);
  }
}
