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
        return [ticker, quote?.priceUsdt ?? 0] as const;
      }),
    );
    const livePrices = new Map(quoteEntries);

    return investments.map((inv) => {
      const shares = toNumber(inv.shares);
      const storedPrice = toNumber(inv.currentPrice);
      const livePrice = livePrices.get(inv.ticker.toUpperCase()) ?? 0;
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
        lastAction: inv.lastAction,
      };
    });
  }

  async equityUsdt(userId: string): Promise<EquitySnapshot> {
    const [wallets, positions] = await Promise.all([
      this.prisma.wallet.findMany({
        where: { userId },
        select: { balance: true },
      }),
      this.livePositions(userId),
    ]);

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

  async ensureOpeningSnapshot(userId: string, equity: EquitySnapshot): Promise<void> {
    const today = this.startOfUtcDay();
    await createPortfolioSnapshotIfMissing(this.prisma, userId, today, SNAPSHOT_KIND.OPENING, {
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
      }
    }

    let netDeposits = 0;
    let netWithdrawals = 0;
    let netPositionRegisters = 0;
    for (const tx of todayFlows) {
      const amount = toNumber(tx.amount);
      if (tx.category === FINANCE_TX_CATEGORY.DEPOSIT) {
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
