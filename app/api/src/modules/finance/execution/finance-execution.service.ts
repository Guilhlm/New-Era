import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InvestmentLastAction, TransactionType } from '@prisma/client';
import {
  assertResourceExists,
  assertResourceOwner,
} from '../../../common/auth/ownership.util';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  getOrCreatePrimaryCashWallet,
  syncUserFinanceState,
} from '../common/finance-balance.util';
import {
  creditWallet,
  debitWalletAtomic,
  fxSnapshotFields,
} from '../common/ledger.util';
import { decimalUsdt } from '../common/money.util';
import {
  deriveInvestmentValues,
  resolveBuyTrade,
  resolveDebitUsdt,
  roundUsdt,
  toNumber,
} from '../common/investment-value.util';
import {
  FINANCE_TX_CATEGORY,
  type DepositFundsDto,
  type RegisterPositionDto,
  type TradeInvestmentDto,
  type WithdrawFundsDto,
} from '../investment/dto/investment.dto';
import { findMarketAsset } from '../market/market.constants';
import type { MarketTradeDto } from '../market/dto/market.dto';
import { MarketProviders } from '../market/market.providers';
import { MonthlyExpenseService } from '../monthly-expense/monthly-expense.service';

export type TradePreviewResult = {
  ticker: string;
  action: InvestmentLastAction;
  priceUsdt: number;
  shares: number;
  debitUsdt: number;
  sufficient: boolean;
};

@Injectable()
export class FinanceExecutionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly marketProviders: MarketProviders,
    private readonly monthlyExpenses: MonthlyExpenseService,
  ) {}

  private roundShares(value: number): number {
    return Math.round(value * 1e6) / 1e6;
  }

  private depositCategoryForSource(source: DepositFundsDto['source']) {
    if (source === 'CARD') return FINANCE_TX_CATEGORY.DEPOSIT_CARD;
    if (source === 'MONTHLY_SALARY') return FINANCE_TX_CATEGORY.DEPOSIT_SALARY;
    if (source === 'EXTRA_INCOME') return FINANCE_TX_CATEGORY.DEPOSIT_EXTRA_INCOME;
    return FINANCE_TX_CATEGORY.DEPOSIT_CASH;
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

  private async toUsdtAmount(
    amount: number,
    currency: 'USDT' | 'BRL' = 'USDT',
  ): Promise<number> {
    if (currency === 'USDT') return roundUsdt(amount);
    const rate = await this.marketProviders.getUsdtToBrlRate();
    if (rate <= 0) {
      throw new BadRequestException('FX rate unavailable.');
    }
    return roundUsdt(amount / rate);
  }

  private async resolveCashWallet(userId: string, walletId?: string | null) {
    const wallet = walletId
      ? await this.prisma.wallet.findUnique({ where: { id: walletId } })
      : await getOrCreatePrimaryCashWallet(this.prisma, userId);

    if (!wallet) {
      throw new NotFoundException('Wallet not found.');
    }
    assertResourceOwner(wallet.userId, userId, 'Wallet');
    return wallet;
  }

  private async resolveTradePriceUsdt(
    ticker: string,
    data: MarketTradeDto,
    storedPrice = 0,
    allowClientFallback = true,
  ): Promise<number> {
    const price = await this.marketProviders.resolvePriceUsdt(ticker, {
      clientPrice: allowClientFallback ? data.price : undefined,
      storedPrice,
    });
    if (price <= 0) {
      throw new BadRequestException('Market price unavailable for this asset.');
    }
    return price;
  }

  async previewTrade(userId: string, data: MarketTradeDto): Promise<TradePreviewResult> {
    const ticker = data.ticker.toUpperCase();
    const wallet = await getOrCreatePrimaryCashWallet(this.prisma, userId);
    const walletBalance = roundUsdt(toNumber(wallet.balance));

    const existing = await this.prisma.investment.findFirst({
      where: { userId, ticker },
    });
    const storedPrice = existing ? toNumber(existing.currentPrice) : 0;

    if (data.action === InvestmentLastAction.SELL) {
      if (!existing) {
        throw new BadRequestException('No position to sell.');
      }

      const price = await this.resolveTradePriceUsdt(ticker, data, storedPrice);
      const shares = this.roundShares(data.shares);
      const debitUsdt = roundUsdt(shares * price);
      const currentShares = toNumber(existing.shares);

      return {
        ticker,
        action: data.action,
        priceUsdt: price,
        shares,
        debitUsdt,
        sufficient: shares <= currentShares + 1e-8 && shares >= 0.000001,
      };
    }

    const price = await this.resolveTradePriceUsdt(ticker, data, storedPrice);

    try {
      const resolved = resolveBuyTrade(price, walletBalance, {
        budgetUsdt: data.budgetUsdt,
        shares: data.budgetUsdt != null ? undefined : this.roundShares(data.shares),
      });
      return {
        ticker,
        action: data.action,
        priceUsdt: price,
        shares: resolved.shares,
        debitUsdt: resolved.debitUsdt,
        sufficient: true,
      };
    } catch {
      return {
        ticker,
        action: data.action,
        priceUsdt: price,
        shares: 0,
        debitUsdt: 0,
        sufficient: false,
      };
    }
  }

  async deposit(userId: string, data: DepositFundsDto) {
    await this.assertMonthlyIncomeConfigured(userId);
    const source = data.source ?? 'MONTHLY_SALARY';
    const currency = data.currency ?? (source === 'MONTHLY_SALARY' ? 'BRL' : 'USDT');
    if (source === 'MONTHLY_SALARY' && currency !== 'BRL') {
      throw new BadRequestException('Wallet salary deposits must be in BRL.');
    }
    if (source === 'MONTHLY_SALARY') {
      const salaryRemaining = await this.monthlyExpenses.getSalaryRemaining(userId);
      if (data.amount > salaryRemaining) {
        throw new BadRequestException('Deposit exceeds the available monthly salary.');
      }
    }
    const fxRate =
      currency === 'BRL' ? await this.marketProviders.getUsdtToBrlRate() : undefined;
    const amountUsdt = await this.toUsdtAmount(data.amount, currency);
    const wallet = await this.resolveCashWallet(userId, data.walletId);
    const card =
      source === 'CARD'
        ? data.cardId
          ? await this.prisma.card.findUnique({ where: { id: data.cardId } })
          : null
        : null;

    if (source === 'CARD') {
      if (!card) {
        throw new BadRequestException('Select a card for card deposits.');
      }
      assertResourceOwner(card.userId, userId, 'Card');
      const limitTotal = Number(card.limitTotal ?? 0);
      const limitUsage = Number(card.limitUsage ?? 0);
      if (limitTotal > 0 && limitUsage + data.amount > limitTotal) {
        throw new BadRequestException('Insufficient card limit.');
      }
    }

    await this.prisma.$transaction(async (tx) => {
      if (source === 'CARD' && card) {
        await tx.card.update({
          where: { id: card.id },
          data: { limitUsage: { increment: data.amount } },
        });
      }
      await creditWallet(tx, wallet.id, amountUsdt);
      await tx.transaction.create({
        data: {
          userId,
          type: 'INCOME',
          amount: decimalUsdt(amountUsdt),
          description:
            data.description ??
            `Deposit (${source}) • ${data.amount.toFixed(2)} ${currency} → ${amountUsdt.toFixed(2)} USDT`,
          category: this.depositCategoryForSource(source),
          toWalletId: wallet.id,
          date: new Date(),
          ...fxSnapshotFields({
            displayAmount: data.amount,
            displayCurrency: currency,
            fxRate,
          }),
        },
      });
    });

    await syncUserFinanceState(this.prisma, userId);
    return { ok: true, walletId: wallet.id, amountUsdt };
  }

  async withdraw(userId: string, data: WithdrawFundsDto) {
    await this.assertMonthlyIncomeConfigured(userId);
    const currency = data.currency ?? 'BRL';
    if (currency !== 'BRL') {
      throw new BadRequestException('Wallet withdrawals must be in BRL.');
    }
    const wallet = await this.resolveCashWallet(userId, data.walletId);
    const balance = toNumber(wallet.balance);
    const fxRate =
      currency === 'BRL' ? await this.marketProviders.getUsdtToBrlRate() : 1;

    let amountUsdt: number;
    try {
      amountUsdt = resolveDebitUsdt(data.amount, currency, balance, fxRate);
    } catch {
      throw new BadRequestException('Insufficient wallet balance.');
    }

    await this.prisma.$transaction(async (tx) => {
      await debitWalletAtomic(tx, wallet.id, amountUsdt);
      await tx.transaction.create({
        data: {
          userId,
          type: 'EXPENSE',
          amount: decimalUsdt(amountUsdt),
          description:
            data.description ??
            `Withdraw • ${data.amount.toFixed(2)} ${currency} → ${amountUsdt.toFixed(2)} USDT`,
          category: FINANCE_TX_CATEGORY.WITHDRAW,
          fromWalletId: wallet.id,
          date: new Date(),
          ...fxSnapshotFields({
            displayAmount: data.amount,
            displayCurrency: currency,
            fxRate: currency === 'BRL' ? fxRate : undefined,
          }),
        },
      });
    });

    await syncUserFinanceState(this.prisma, userId);
    return { ok: true, walletId: wallet.id, amountUsdt };
  }

  async registerPosition(userId: string, data: RegisterPositionDto) {
    await this.assertMonthlyIncomeConfigured(userId);
    if (data.costTotal == null && data.avgPrice == null) {
      throw new BadRequestException('Enter the total paid or average price.');
    }

    const ticker = data.ticker.toUpperCase();
    const asset = findMarketAsset(ticker);
    const quote = await this.marketProviders.fetchQuoteForTicker(ticker);
    const costCurrency = data.costCurrency ?? 'USDT';

    let avgPriceUsdt: number;
    if (data.costTotal != null) {
      const costTotalUsdt = await this.toUsdtAmount(data.costTotal, costCurrency);
      avgPriceUsdt = data.shares > 0 ? roundUsdt(costTotalUsdt / data.shares) : 0;
    } else {
      avgPriceUsdt = await this.toUsdtAmount(data.avgPrice!, costCurrency);
    }

    const currentPriceUsdt = quote?.priceUsdt ?? 0;
    const name = data.name?.trim() || asset?.name || quote?.name || ticker;
    const type = data.type ?? asset?.type ?? quote?.type;
    if (!type) {
      throw new BadRequestException('Unrecognized asset type.');
    }

    const existing = await this.prisma.investment.findFirst({
      where: { userId, ticker },
    });

    const addedCostUsdt = roundUsdt(data.shares * avgPriceUsdt);
    const txDescription = `Register ${ticker} • ${data.shares} shares • $${addedCostUsdt.toFixed(2)} USDT cost`;

    if (existing) {
      const oldShares = toNumber(existing.shares);
      const oldAvg = toNumber(existing.avgPrice);
      const addedShares = data.shares;
      const nextShares = oldShares + addedShares;
      const nextAvg =
        nextShares > 0
          ? roundUsdt((oldShares * oldAvg + addedShares * avgPriceUsdt) / nextShares)
          : avgPriceUsdt;

      const derived = deriveInvestmentValues({
        shares: nextShares,
        avgPrice: nextAvg,
        currentPrice: currentPriceUsdt,
      });

      const investment = await this.prisma.$transaction(async (tx) => {
        const updated = await tx.investment.update({
          where: { id: existing.id },
          data: {
            name,
            type,
            shares: derived.shares,
            avgPrice: derived.avgPrice,
            currentPrice: derived.currentPrice,
            currentValue: derived.currentValue,
            costValue: derived.costValue,
            notes: data.notes ?? existing.notes,
          },
        });

        await tx.transaction.create({
          data: {
            userId,
            type: TransactionType.EXPENSE,
            amount: addedCostUsdt,
            description: txDescription,
            category: FINANCE_TX_CATEGORY.POSITION_REGISTER,
            date: new Date(),
          },
        });

        return updated;
      });

      await syncUserFinanceState(this.prisma, userId);
      return investment;
    }

    const derived = deriveInvestmentValues({
      shares: data.shares,
      avgPrice: avgPriceUsdt,
      currentPrice: currentPriceUsdt,
    });

    const investment = await this.prisma.$transaction(async (tx) => {
      const created = await tx.investment.create({
        data: {
          userId,
          ticker,
          name,
          type,
          shares: derived.shares,
          avgPrice: derived.avgPrice,
          currentPrice: derived.currentPrice,
          currentValue: derived.currentValue,
          costValue: derived.costValue,
          lastAction: InvestmentLastAction.BUY,
          notes: data.notes ?? 'Position registered manually',
        },
      });

      await tx.transaction.create({
        data: {
          userId,
          type: TransactionType.EXPENSE,
          amount: addedCostUsdt,
          description: txDescription,
          category: FINANCE_TX_CATEGORY.POSITION_REGISTER,
          date: new Date(),
        },
      });

      return created;
    });

    await syncUserFinanceState(this.prisma, userId);
    return investment;
  }

  async tradeByTicker(userId: string, data: MarketTradeDto) {
    await this.assertMonthlyIncomeConfigured(userId);
    const ticker = data.ticker.toUpperCase();
    let shares = this.roundShares(data.shares);

    const wallet = await getOrCreatePrimaryCashWallet(this.prisma, userId);
    const walletBalance = roundUsdt(toNumber(wallet.balance));

    let existing = await this.prisma.investment.findFirst({
      where: { userId, ticker },
    });

    const storedPrice = existing ? toNumber(existing.currentPrice) : 0;
    let price = 0;
    let debitUsdt = 0;
    let totalUsdt = 0;

    if (data.action === InvestmentLastAction.SELL) {
      if (!existing) {
        throw new BadRequestException('No position to sell.');
      }

      // Preço de venda sempre resolvido no servidor; nunca confiar no valor do cliente.
      price = await this.resolveTradePriceUsdt(ticker, data, storedPrice, false);
      debitUsdt = roundUsdt(shares * price);
      totalUsdt = debitUsdt;

      const currentShares = toNumber(existing.shares);
      if (shares > currentShares + 1e-8) {
        throw new BadRequestException('Insufficient shares.');
      }
    } else {
      price = await this.resolveTradePriceUsdt(ticker, data, storedPrice, false);

      try {
        const resolved = resolveBuyTrade(price, walletBalance, {
          budgetUsdt: data.budgetUsdt,
          shares: data.budgetUsdt != null ? undefined : shares,
        });
        shares = resolved.shares;
        debitUsdt = resolved.debitUsdt;
        totalUsdt = debitUsdt;
      } catch (error) {
        if (error instanceof Error && error.message.includes('price unavailable')) {
          throw new BadRequestException('Market price unavailable for this asset.');
        }
        throw new BadRequestException('Insufficient wallet balance.');
      }
    }

    const currentShares = existing ? toNumber(existing.shares) : 0;
    const nextShares =
      data.action === InvestmentLastAction.BUY
        ? currentShares + shares
        : Math.max(0, currentShares - shares);

    const avgPrice =
      data.action === InvestmentLastAction.BUY && nextShares > 0
        ? existing
          ? (toNumber(existing.costValue) + debitUsdt) / nextShares
          : debitUsdt / shares
        : existing
          ? toNumber(existing.avgPrice)
          : 0;

    const derived = deriveInvestmentValues({
      shares: nextShares,
      avgPrice,
      currentPrice: price,
    });

    const description =
      data.action === InvestmentLastAction.BUY
        ? `Buy ${ticker} • ${shares} shares • $${price.toFixed(2)} USDT`
        : `Sell ${ticker} • ${shares} shares • $${price.toFixed(2)} USDT`;

    const tradeAmountUsdt =
      data.action === InvestmentLastAction.BUY ? debitUsdt : totalUsdt;
    const txType = data.action === InvestmentLastAction.BUY ? 'EXPENSE' : 'INCOME';

    await this.prisma.$transaction(async (tx) => {
      if (data.action === InvestmentLastAction.BUY) {
        await debitWalletAtomic(tx, wallet.id, tradeAmountUsdt);
      } else {
        await creditWallet(tx, wallet.id, tradeAmountUsdt);
      }

      await tx.transaction.create({
        data: {
          userId,
          type: txType,
          amount: decimalUsdt(tradeAmountUsdt),
          description,
          category:
            data.action === InvestmentLastAction.BUY
              ? FINANCE_TX_CATEGORY.INVESTMENT_BUY
              : FINANCE_TX_CATEGORY.INVESTMENT_SELL,
          ...(data.action === InvestmentLastAction.BUY
            ? { fromWalletId: wallet.id }
            : { toWalletId: wallet.id }),
          date: new Date(),
        },
      });

      if (existing) {
        if (nextShares <= 0) {
          await tx.investment.delete({ where: { id: existing.id } });
        } else {
          await tx.investment.update({
            where: { id: existing.id },
            data: {
              shares: derived.shares,
              avgPrice: derived.avgPrice,
              currentPrice: derived.currentPrice,
              currentValue: derived.currentValue,
              costValue: derived.costValue,
              lastAction: data.action,
            },
          });
        }
      } else if (data.action === InvestmentLastAction.BUY) {
        await tx.investment.create({
          data: {
            userId,
            ticker,
            name: data.name,
            type: data.type,
            shares: derived.shares,
            avgPrice: derived.avgPrice,
            currentPrice: derived.currentPrice,
            currentValue: derived.currentValue,
            costValue: derived.costValue,
            lastAction: data.action,
          },
        });
      }
    });

    existing = await this.prisma.investment.findFirst({
      where: { userId, ticker },
    });

    await syncUserFinanceState(this.prisma, userId);
    return existing ?? { ok: true };
  }

  async tradeByInvestmentId(
    investmentId: string,
    userId: string,
    data: TradeInvestmentDto,
  ) {
    await this.assertMonthlyIncomeConfigured(userId);
    const existing = await this.prisma.investment.findUnique({
      where: { id: investmentId },
    });
    const investment = assertResourceExists(existing, 'Investment');
    assertResourceOwner(investment.userId, userId, 'Investment');

    return this.tradeByTicker(userId, {
      ticker: investment.ticker || investment.name,
      name: investment.name,
      type: investment.type,
      action: data.action,
      shares: data.shares,
      price: data.price,
    });
  }
}
