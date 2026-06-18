import { BadRequestException, Injectable } from '@nestjs/common';
import { CardType, type Prisma } from '@prisma/client';
import {
  assertResourceExists,
  assertResourceOwner,
} from '../../../common/auth/ownership.util';
import { PrismaService } from '../../../prisma/prisma.service';
import type {
  CreateCardDto,
  CreateMonthlyExpenseCategoryDto,
  CreateMonthlyExpenseDto,
  MonthlyExpensesSummaryQueryDto,
  UpdateCardDto,
  UpdateMonthlyExpenseCategoryDto,
  UpdateMonthlyExpenseDto,
} from './dto/monthly-expense.dto';

const SYSTEM_CATEGORY_PRESETS = [
  { key: 'INVESTMENTS', name: 'Investments' },
  { key: 'EMERGENCY_RESERVE', name: 'Emergency Reserve' },
  { key: 'FINANCIAL_GOALS', name: 'Financial Goals' },
] as const;

const INVESTMENT_EXPENSE_TX_CATEGORIES = new Set([
  'INVESTMENT_BUY',
  'POSITION_REGISTER',
]);

const FINANCIAL_GOAL_EXPENSE_TX_CATEGORIES = new Set([
  'FINANCIAL_GOAL_CONTRIBUTION',
]);

const WALLET_DEPOSIT_TX_CATEGORIES = new Set([
  'DEPOSIT',
  'DEPOSIT_CARD',
  'DEPOSIT_CASH',
  'DEPOSIT_SALARY',
  'DEPOSIT_EXTRA_INCOME',
]);

const WALLET_MONTHLY_REVERSAL_TX_CATEGORIES = new Set(['WITHDRAW']);

const MONTHLY_EXPENSE_ADJUSTMENT_SOURCE = 'ADJUSTMENT';
const MONTHLY_EXPENSE_CASH_SOURCE = 'CASH';
const MONTHLY_EXPENSE_CARD_SOURCE_PREFIX = 'CARD:';

type SystemCategoryKey = (typeof SYSTEM_CATEGORY_PRESETS)[number]['key'];

function monthKeyFromDate(value: Date) {
  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function dateRangeForMonth(monthKey: string) {
  const [yearText, monthText] = monthKey.split('-');
  const year = Number(yearText);
  const month = Number(monthText);
  if (!Number.isFinite(year) || !Number.isFinite(month)) {
    throw new BadRequestException('Invalid month. Expected YYYY-MM.');
  }
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 1, 0, 0, 0));
  return { start, end };
}

function normalizeMonth(month?: string) {
  if (!month) return monthKeyFromDate(new Date());
  if (!/^\d{4}-\d{2}$/.test(month)) {
    throw new BadRequestException('Invalid month. Expected YYYY-MM.');
  }
  return month;
}

function isPaidStatus(status?: string | null) {
  return (status ?? 'paid') === 'paid';
}

function cardIdFromExpenseSource(source?: string | null) {
  if (!source?.startsWith(MONTHLY_EXPENSE_CARD_SOURCE_PREFIX)) return null;
  return source.slice(MONTHLY_EXPENSE_CARD_SOURCE_PREFIX.length) || null;
}

function expenseAmountForTotals(item: { amount: unknown; source?: string | null }) {
  const amount = Number(item.amount ?? 0);
  if (
    item.source === MONTHLY_EXPENSE_ADJUSTMENT_SOURCE ||
    WALLET_MONTHLY_REVERSAL_TX_CATEGORIES.has(item.source ?? '')
  ) {
    return amount;
  }
  return Math.abs(amount);
}

function clampMoney(value: number) {
  return Math.max(0, Number(value.toFixed(2)));
}

function transactionAmountBrl(tx: {
  amount: unknown;
  displayAmount?: unknown;
  displayCurrency?: string | null;
  fxRate?: unknown;
}) {
  if (tx.displayCurrency === 'BRL' && tx.displayAmount != null) {
    return Number(tx.displayAmount);
  }
  const amount = Number(tx.amount ?? 0);
  const fxRate = Number(tx.fxRate ?? 0);
  return fxRate > 0 ? amount * fxRate : amount;
}

@Injectable()
export class MonthlyExpenseService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertMonthlyIncomeConfigured(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { monthlyIncome: true },
    });
    if (Number(user?.monthlyIncome ?? 0) <= 0) {
      throw new BadRequestException('Set your monthly salary to use the finance area.');
    }
    return Number(user!.monthlyIncome);
  }

  private async ensureSystemCategories(userId: string) {
    await Promise.all(
      SYSTEM_CATEGORY_PRESETS.map(async (preset) => {
        const existing = await this.prisma.monthlyExpenseCategory.findFirst({
          where: { userId, systemKey: preset.key },
        });
        if (!existing) {
          await this.prisma.monthlyExpenseCategory.create({
            data: {
              userId,
              name: preset.name,
              budget: 0,
              isSystem: true,
              isLocked: true,
              systemKey: preset.key,
            },
          });
          return;
        }
        if (
          existing.name !== preset.name ||
          !existing.isSystem ||
          !existing.isLocked
        ) {
          await this.prisma.monthlyExpenseCategory.update({
            where: { id: existing.id },
            data: {
              name: preset.name,
              isSystem: true,
              isLocked: true,
              systemKey: preset.key,
            },
          });
        }
      }),
    );
  }

  private async findCategoryOrThrow(id: string, userId: string) {
    const found = await this.prisma.monthlyExpenseCategory.findUnique({ where: { id } });
    const category = assertResourceExists(found, 'Expense category');
    assertResourceOwner(category.userId, userId, 'Expense category');
    return category;
  }

  private async findExpenseOrThrow(id: string, userId: string) {
    const found = await this.prisma.monthlyExpense.findUnique({ where: { id } });
    const expense = assertResourceExists(found, 'Monthly expense');
    assertResourceOwner(expense.userId, userId, 'Monthly expense');
    return expense;
  }

  private async findCardOrThrow(id: string, userId: string) {
    const found = await this.prisma.card.findUnique({ where: { id } });
    const card = assertResourceExists(found, 'Card');
    assertResourceOwner(card.userId, userId, 'Card');
    return card;
  }

  private async assertExpenseSourceOwner(source: string, userId: string) {
    const cardId = cardIdFromExpenseSource(source);
    if (!cardId) return;
    await this.findCardOrThrow(cardId, userId);
  }

  private async adjustCardUsage(
    tx: Prisma.TransactionClient,
    cardId: string | null,
    amount: number,
  ) {
    if (!cardId || amount === 0) return;
    const card = await tx.card.findUnique({
      where: { id: cardId },
      select: { limitUsage: true, limitTotal: true },
    });
    if (!card) return;
    const limitTotal = Number(card.limitTotal ?? 0);
    const currentUsage = Number(card.limitUsage ?? 0);
    const nextUsage = currentUsage + amount;
    if (amount > 0 && limitTotal > 0 && nextUsage > limitTotal) {
      throw new BadRequestException('Insufficient card limit.');
    }
    await tx.card.update({
      where: { id: cardId },
      data: { limitUsage: Math.max(0, nextUsage) },
    });
  }

  private async monthSpentFromTransactions(
    userId: string,
    monthKey: string,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    const { start, end } = dateRangeForMonth(monthKey);
    const rows = await client.transaction.findMany({
      where: {
        userId,
        date: { gte: start, lt: end },
        category: {
          in: [
            ...INVESTMENT_EXPENSE_TX_CATEGORIES,
            ...FINANCIAL_GOAL_EXPENSE_TX_CATEGORIES,
            'DEPOSIT_SALARY',
            ...WALLET_MONTHLY_REVERSAL_TX_CATEGORIES,
          ],
        },
      },
    });
    return rows.reduce((sum, item) => {
      const amount = transactionAmountBrl(item);
      return sum + (item.category === 'WITHDRAW' ? -Math.abs(amount) : Math.abs(amount));
    }, 0);
  }

  private async monthSpentFromManualExpenses(userId: string, monthKey: string) {
    const { start, end } = dateRangeForMonth(monthKey);
    const rows = await this.prisma.monthlyExpense.findMany({
      where: {
        userId,
        OR: [{ monthKey }, { monthKey: null, createdAt: { gte: start, lt: end } }],
        status: 'paid',
      },
      select: { amount: true, source: true },
    });
    return rows.reduce((sum, item) => sum + expenseAmountForTotals(item), 0);
  }

  private previousMonth(monthKey: string) {
    const [yearText, monthText] = monthKey.split('-');
    const base = new Date(Date.UTC(Number(yearText), Number(monthText) - 1, 1));
    base.setUTCMonth(base.getUTCMonth() - 1);
    return monthKeyFromDate(base);
  }

  private formatExpenseAccount(
    source: string,
    cardsById: Map<string, { brand: string | null; lastFour: string | null }>,
  ) {
    if (source === MONTHLY_EXPENSE_CASH_SOURCE || source === 'MANUAL') return 'Cash';
    const cardId = cardIdFromExpenseSource(source);
    if (!cardId) return source;
    const card = cardsById.get(cardId);
    if (!card) return 'Card removed';
    const brand = card.brand === 'mastercard' ? 'Mastercard' : 'Visa';
    return `${brand} •••• ${card.lastFour ?? '0000'}`;
  }

  private depositAccountLabel(category: string) {
    if (category === 'DEPOSIT_SALARY') return 'Monthly salary';
    if (category === 'DEPOSIT_EXTRA_INCOME') return 'Extra income';
    if (category === 'DEPOSIT_CARD') return 'Card';
    return 'Wallet';
  }

  async getSummary(userId: string, query: MonthlyExpensesSummaryQueryDto) {
    const monthlyIncome = await this.assertMonthlyIncomeConfigured(userId);
    await this.ensureSystemCategories(userId);
    const month = normalizeMonth(query.month);
    const { start, end } = dateRangeForMonth(month);
    const limit = query.limit ?? 100;

    const [categories, manualExpenses, transactionExpenses, cards] = await Promise.all([
      this.prisma.monthlyExpenseCategory.findMany({
        where: { userId },
        orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
      }),
      this.prisma.monthlyExpense.findMany({
        where: {
          userId,
          OR: [{ monthKey: month }, { monthKey: null, createdAt: { gte: start, lt: end } }],
        },
        include: { categoryRef: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      this.prisma.transaction.findMany({
        where: {
          userId,
          date: { gte: start, lt: end },
          category: {
            in: [
              ...INVESTMENT_EXPENSE_TX_CATEGORIES,
              ...FINANCIAL_GOAL_EXPENSE_TX_CATEGORIES,
              ...WALLET_DEPOSIT_TX_CATEGORIES,
              ...WALLET_MONTHLY_REVERSAL_TX_CATEGORIES,
            ],
          },
        },
        orderBy: { date: 'desc' },
        take: limit,
      }),
      this.prisma.card.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const categoriesBySystem = new Map(
      categories.filter((item) => item.systemKey).map((item) => [item.systemKey!, item]),
    );
    const cardsById = new Map(cards.map((item) => [item.id, item]));

    const mappedManual = manualExpenses.map((item) => ({
      id: item.id,
      date: item.createdAt.toISOString(),
      title: item.title,
      categoryId: item.categoryId,
      categoryName: item.categoryRef?.name ?? item.category ?? 'Uncategorized',
      amount: Number(item.amount),
      account: this.formatExpenseAccount(item.source, cardsById),
      status: item.status ?? 'paid',
      fixed: item.fixed,
      source: item.source,
      linkedTransactionId: item.transactionId,
      editable: true,
      deletable: true,
    }));

    const investmentCategory = categoriesBySystem.get('INVESTMENTS');
    const financialGoalsCategory = categoriesBySystem.get('FINANCIAL_GOALS');
    const mappedTxExpenses = transactionExpenses.map((item) => {
      const category = item.category ?? '';
      const isDeposit = WALLET_DEPOSIT_TX_CATEGORIES.has(category);
      const isReversal = WALLET_MONTHLY_REVERSAL_TX_CATEGORIES.has(category);
      const isGoalContribution = FINANCIAL_GOAL_EXPENSE_TX_CATEGORIES.has(category);
      const amountBrl = transactionAmountBrl(item);
      return {
        id: `tx-${item.id}`,
        date: item.date.toISOString(),
        title: isReversal
          ? (item.description ?? 'Wallet withdrawal')
          : isDeposit
          ? (item.description ?? 'Wallet deposit')
          : isGoalContribution
          ? (item.description ?? 'Goal contribution')
          : (item.description ?? 'Investment transaction'),
        categoryId: isDeposit || isReversal
          ? null
          : isGoalContribution
          ? (financialGoalsCategory?.id ?? null)
          : (investmentCategory?.id ?? null),
        categoryName: isDeposit || isReversal
          ? 'Wallet'
          : isGoalContribution
          ? (financialGoalsCategory?.name ?? 'Financial Goals')
          : (investmentCategory?.name ?? 'Investments'),
        amount: isReversal ? -Math.abs(amountBrl) : Math.abs(amountBrl),
        account: isReversal
          ? 'Withdrawal'
          : isDeposit
          ? this.depositAccountLabel(category)
          : isGoalContribution
          ? 'Monthly budget'
          : (item.fromWalletId ? 'Wallet' : 'Investment'),
        status: 'paid',
        fixed: !isDeposit && !isReversal && !isGoalContribution,
        source: category,
        linkedTransactionId: item.id,
        editable: false,
        deletable: isGoalContribution,
      };
    });

    const expenseRows = [...mappedManual, ...mappedTxExpenses].sort((a, b) =>
      b.date.localeCompare(a.date),
    );

    const paidExpenseRows = expenseRows.filter((item) => isPaidStatus(item.status));
    const spent = clampMoney(
      paidExpenseRows.reduce((sum, item) => {
        if (item.source === 'DEPOSIT_EXTRA_INCOME') return sum;
        return sum + expenseAmountForTotals(item);
      }, 0),
    );
    const income = monthlyIncome;
    const cardLimit = cards.reduce((sum, item) => sum + Number(item.limitTotal ?? 0), 0);
    const budget = income + cardLimit;
    const userCategories = categories.filter((item) => !item.isSystem);
    const fixedCommitments = clampMoney(
      userCategories.reduce((sum, item) => sum + Number(item.budget ?? 0), 0) +
        paidExpenseRows.reduce(
          (sum, item) => sum + (item.fixed ? expenseAmountForTotals(item) : 0),
          0,
        ),
    );
    const previousMonth = this.previousMonth(month);
    const previousSpentManual = await this.monthSpentFromManualExpenses(
      userId,
      previousMonth,
    );
    const previousSpentTx = await this.monthSpentFromTransactions(userId, previousMonth);
    const previousSpent = previousSpentManual + previousSpentTx;
    const vsLastMonth =
      previousSpent <= 0 ? 0 : Number((((spent - previousSpent) / previousSpent) * 100).toFixed(1));

    const spentByCategory = new Map<string, number>();
    for (const row of paidExpenseRows) {
      const key = row.categoryId ?? row.categoryName;
      if (row.source === 'DEPOSIT_EXTRA_INCOME') continue;
      spentByCategory.set(
        key,
        (spentByCategory.get(key) ?? 0) + expenseAmountForTotals(row),
      );
    }

    return {
      month,
      summary: {
        spent,
        budget,
        remaining: income - spent,
        vsLastMonth,
        income,
        cardLimit,
        fixedCommitments,
      },
      categories: userCategories.map((item) => ({
        id: item.id,
        name: item.name,
        budget: Number(item.budget),
        spent: clampMoney(spentByCategory.get(item.id) ?? spentByCategory.get(item.name) ?? 0),
        isSystem: false,
        isLocked: false,
        systemKey: null,
      })),
      cards: cards.map((item) => ({
        id: item.id,
        holderName: item.holderName ?? 'Sem titular',
        lastFour: item.lastFour ?? '0000',
        brand: item.brand?.toLowerCase() ?? 'visa',
        color: item.color ?? '#1e3a8a',
        limitTotal: Number(item.limitTotal ?? 0),
        limitUsage: Number(item.limitUsage ?? 0),
        type: item.type,
      })),
      expenses: expenseRows,
    };
  }

  async createExpense(userId: string, data: CreateMonthlyExpenseDto) {
    await this.assertMonthlyIncomeConfigured(userId);
    await this.ensureSystemCategories(userId);
    const category = data.categoryId
      ? await this.findCategoryOrThrow(data.categoryId, userId)
      : null;
    const when = data.date ? new Date(data.date) : new Date();
    const month = monthKeyFromDate(when);
    const source = data.account?.trim() || MONTHLY_EXPENSE_CASH_SOURCE;
    await this.assertExpenseSourceOwner(source, userId);

    return this.prisma.$transaction(async (tx) => {
      const expense = await tx.monthlyExpense.create({
        data: {
          userId,
          title: data.title.trim(),
          amount: Math.abs(data.amount),
          category: category?.name ?? null,
          categoryId: category?.id,
          monthKey: month,
          source,
          status: data.status ?? 'paid',
          fixed: false,
          createdAt: when,
        },
      });
      if (isPaidStatus(expense.status)) {
        await this.adjustCardUsage(
          tx,
          cardIdFromExpenseSource(expense.source),
          Math.abs(Number(expense.amount)),
        );
      }
      return expense;
    });
  }

  async updateExpense(id: string, userId: string, data: UpdateMonthlyExpenseDto) {
    await this.assertMonthlyIncomeConfigured(userId);
    const existing = await this.findExpenseOrThrow(id, userId);
    if (existing.transactionId) {
      throw new BadRequestException(
        'This expense is linked to wallet activity and cannot be edited.',
      );
    }

    const category = data.categoryId
      ? await this.findCategoryOrThrow(data.categoryId, userId)
      : undefined;
    const when = data.date ? new Date(data.date) : undefined;
    const month = when ? monthKeyFromDate(when) : undefined;
    const nextSource =
      data.account !== undefined
        ? data.account.trim() || MONTHLY_EXPENSE_CASH_SOURCE
        : existing.source;
    await this.assertExpenseSourceOwner(nextSource, userId);
    const nextAmount = data.amount !== undefined ? Math.abs(data.amount) : Number(existing.amount);
    const nextStatus = data.status ?? existing.status;
    const previousCardId = cardIdFromExpenseSource(existing.source);
    const nextCardId = cardIdFromExpenseSource(nextSource);

    return this.prisma.$transaction(async (tx) => {
      if (isPaidStatus(existing.status)) {
        await this.adjustCardUsage(tx, previousCardId, -Math.abs(Number(existing.amount)));
      }

      const updated = await tx.monthlyExpense.update({
        where: { id },
        data: {
          ...(data.title !== undefined ? { title: data.title.trim() } : {}),
          ...(data.amount !== undefined ? { amount: nextAmount } : {}),
          ...(data.categoryId !== undefined
            ? {
                categoryId: category?.id ?? null,
                category: category?.name ?? null,
              }
            : {}),
          ...(data.account !== undefined ? { source: nextSource } : {}),
          ...(data.status !== undefined ? { status: data.status } : {}),
          ...(when ? { createdAt: when, monthKey: month } : {}),
        },
      });

      if (isPaidStatus(nextStatus)) {
        await this.adjustCardUsage(tx, nextCardId, nextAmount);
      }
      return updated;
    });
  }

  async deleteExpense(id: string, userId: string) {
    await this.assertMonthlyIncomeConfigured(userId);
    const existing = await this.findExpenseOrThrow(id, userId);
    if (existing.transactionId) {
      throw new BadRequestException(
        'This expense is linked to wallet activity and cannot be deleted.',
      );
    }
    await this.prisma.$transaction(async (tx) => {
      if (isPaidStatus(existing.status)) {
        await this.adjustCardUsage(
          tx,
          cardIdFromExpenseSource(existing.source),
          -Math.abs(Number(existing.amount)),
        );
      }
      await tx.monthlyExpense.delete({ where: { id } });
    });
    return { ok: true };
  }

  async listCategories(userId: string, month?: string) {
    await this.assertMonthlyIncomeConfigured(userId);
    await this.ensureSystemCategories(userId);
    const monthKey = normalizeMonth(month);
    const summary = await this.getSummary(userId, { month: monthKey });
    return summary.categories;
  }

  async createCategory(userId: string, data: CreateMonthlyExpenseCategoryDto) {
    await this.assertMonthlyIncomeConfigured(userId);
    await this.ensureSystemCategories(userId);
    return this.prisma.monthlyExpenseCategory.create({
      data: {
        userId,
        name: data.name.trim(),
        budget: data.budget ?? 0,
        isSystem: false,
        isLocked: false,
      },
    });
  }

  async updateCategory(
    id: string,
    userId: string,
    data: UpdateMonthlyExpenseCategoryDto,
  ) {
    await this.assertMonthlyIncomeConfigured(userId);
    const existing = await this.findCategoryOrThrow(id, userId);
    if (existing.systemKey === 'FINANCIAL_GOALS') {
      throw new BadRequestException(
        'Financial Goals are updated automatically by the goals area.',
      );
    }
    const spentAdjustment = data.spentAdjustment ?? 0;
    const createAdjustment = Math.abs(spentAdjustment) > 0;
    const now = new Date();
    if (existing.isLocked || existing.isSystem) {
      if (data.name !== undefined && data.name.trim() !== existing.name) {
        throw new BadRequestException('System categories cannot be renamed.');
      }
      return this.prisma.$transaction(async (tx) => {
        const updated = await tx.monthlyExpenseCategory.update({
          where: { id },
          data: {
            ...(data.budget !== undefined ? { budget: data.budget } : {}),
          },
        });
        if (createAdjustment) {
          await tx.monthlyExpense.create({
            data: {
              userId,
              title: 'Category adjustment',
              amount: spentAdjustment,
              category: existing.name,
              categoryId: id,
              monthKey: monthKeyFromDate(now),
              source: MONTHLY_EXPENSE_ADJUSTMENT_SOURCE,
              status: 'paid',
              fixed: false,
              createdAt: now,
            },
          });
        }
        return updated;
      });
    }
    return this.prisma.$transaction(async (tx) => {
      const nextName = data.name !== undefined ? data.name.trim() : existing.name;
      const updated = await tx.monthlyExpenseCategory.update({
        where: { id },
        data: {
          ...(data.name !== undefined ? { name: nextName } : {}),
          ...(data.budget !== undefined ? { budget: data.budget } : {}),
        },
      });
      if (data.name !== undefined && nextName !== existing.name) {
        await tx.monthlyExpense.updateMany({
          where: { userId, categoryId: id },
          data: { category: nextName },
        });
      }
      if (createAdjustment) {
        await tx.monthlyExpense.create({
          data: {
            userId,
            title: 'Ajuste de categoria',
            amount: spentAdjustment,
            category: nextName,
            categoryId: id,
            monthKey: monthKeyFromDate(now),
            source: MONTHLY_EXPENSE_ADJUSTMENT_SOURCE,
            status: 'paid',
            fixed: false,
            createdAt: now,
          },
        });
      }
      return updated;
    });
  }

  async deleteCategory(id: string, userId: string) {
    await this.assertMonthlyIncomeConfigured(userId);
    const existing = await this.findCategoryOrThrow(id, userId);
    if (existing.isLocked || existing.isSystem) {
      throw new BadRequestException('System categories cannot be removed.');
    }
    const dependentExpenses = await this.prisma.monthlyExpense.findMany({
      where: { userId, categoryId: id, transactionId: null },
      select: { id: true, amount: true, source: true, status: true },
    });
    await this.prisma.$transaction(async (tx) => {
      for (const expense of dependentExpenses) {
        if (isPaidStatus(expense.status)) {
          await this.adjustCardUsage(
            tx,
            cardIdFromExpenseSource(expense.source),
            -Math.abs(Number(expense.amount)),
          );
        }
      }
      await tx.monthlyExpense.deleteMany({
        where: { userId, categoryId: id, transactionId: null },
      });
      await tx.monthlyExpenseCategory.delete({ where: { id } });
    });
    return { ok: true };
  }

  async listCards(userId: string) {
    await this.assertMonthlyIncomeConfigured(userId);
    const cards = await this.prisma.card.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return cards.map((item) => ({
      id: item.id,
      holderName: item.holderName ?? 'Sem titular',
      lastFour: item.lastFour ?? '0000',
      brand: item.brand?.toLowerCase() ?? 'visa',
      color: item.color ?? '#1e3a8a',
      limitTotal: Number(item.limitTotal ?? 0),
      limitUsage: Number(item.limitUsage ?? 0),
      type: item.type,
    }));
  }

  async createCard(userId: string, data: CreateCardDto) {
    await this.assertMonthlyIncomeConfigured(userId);
    return this.prisma.card.create({
      data: {
        userId,
        nameCard: `${data.brand ?? 'Card'} ${data.lastFour}`,
        type: data.type ?? CardType.CREDIT,
        holderName: data.holderName.trim().toUpperCase(),
        lastFour: data.lastFour,
        brand: (data.brand ?? 'visa').toLowerCase(),
        color: data.color ?? '#1e3a8a',
        limitTotal: data.limitTotal,
        limitUsage: data.limitUsage ?? 0,
      },
    });
  }

  async updateCard(id: string, userId: string, data: UpdateCardDto) {
    await this.assertMonthlyIncomeConfigured(userId);
    await this.findCardOrThrow(id, userId);
    const nextBrand = data.brand?.toLowerCase();
    return this.prisma.card.update({
      where: { id },
      data: {
        ...(data.holderName !== undefined
          ? { holderName: data.holderName.trim().toUpperCase() }
          : {}),
        ...(data.lastFour !== undefined ? { lastFour: data.lastFour } : {}),
        ...(nextBrand !== undefined ? { brand: nextBrand } : {}),
        ...(data.brand !== undefined || data.lastFour !== undefined
          ? { nameCard: `${nextBrand ?? 'Card'} ${data.lastFour ?? ''}`.trim() }
          : {}),
        ...(data.color !== undefined ? { color: data.color } : {}),
        ...(data.limitTotal !== undefined ? { limitTotal: data.limitTotal } : {}),
        ...(data.limitUsage !== undefined ? { limitUsage: data.limitUsage } : {}),
        ...(data.type !== undefined ? { type: data.type } : {}),
      },
    });
  }

  async deleteCard(id: string, userId: string) {
    await this.assertMonthlyIncomeConfigured(userId);
    await this.findCardOrThrow(id, userId);
    await this.prisma.$transaction(async (tx) => {
      await tx.monthlyExpense.updateMany({
        where: {
          userId,
          source: `${MONTHLY_EXPENSE_CARD_SOURCE_PREFIX}${id}`,
          transactionId: null,
        },
        data: { source: MONTHLY_EXPENSE_CASH_SOURCE },
      });
      await tx.card.delete({ where: { id } });
    });
    return { ok: true };
  }
}
