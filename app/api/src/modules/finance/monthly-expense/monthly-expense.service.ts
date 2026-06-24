import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CardType,
  NotificationCategory,
  NotificationKind,
  NotificationPeriod,
  NotificationPriority,
  type Prisma,
} from '@prisma/client';
import {
  assertResourceExists,
  assertResourceOwner,
} from '../../../common/auth/ownership.util';
import { PrismaService } from '../../../prisma/prisma.service';
import { NotificationService } from '../../notification/notification.service';
import { FINANCE_TX_CATEGORY } from '../investment/dto/investment.dto';
import {
  clampDueDay,
  invoiceBalance,
  isInvoiceCycleOpen,
  monthKeyFromDate,
  resolveCreditCardCycle,
} from './credit-card-cycle.helpers';
import type {
  CreateCardDto,
  CreateCreditCardPurchaseDto,
  CreateMonthlyExpenseCategoryDto,
  CreateMonthlyExpenseDto,
  MonthlyExpensesSummaryQueryDto,
  PayCreditCardInvoiceDto,
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

const CARD_INVOICE_PAYMENT_TX_CATEGORIES = new Set([
  FINANCE_TX_CATEGORY.CARD_INVOICE_PAYMENT,
]);

const MONTHLY_EXPENSE_ADJUSTMENT_SOURCE = 'ADJUSTMENT';
const MONTHLY_EXPENSE_CASH_SOURCE = 'CASH';
const MONTHLY_EXPENSE_EXTRA_INCOME_SOURCE = 'DEPOSIT_EXTRA_INCOME';
const MONTHLY_EXPENSE_CARD_SOURCE_PREFIX = 'CARD:';
const MONTHLY_EXPENSE_CARD_INVOICE_SOURCE = 'CARD_INVOICE';

type SystemCategoryKey = (typeof SYSTEM_CATEGORY_PRESETS)[number]['key'];

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

function monthlySpendingImpact(item: { amount: unknown; source?: string | null }) {
  if (item.source === MONTHLY_EXPENSE_EXTRA_INCOME_SOURCE) {
    return -Math.abs(Number(item.amount ?? 0));
  }
  return expenseAmountForTotals(item);
}

function clampMoney(value: number) {
  return Math.max(0, Number(value.toFixed(2)));
}

function roundMoney(value: number) {
  return Number(value.toFixed(2));
}

function splitInstallments(total: number, installments: number) {
  const cents = Math.round(total * 100);
  const base = Math.floor(cents / installments);
  const remainder = cents - base * installments;
  return Array.from({ length: installments }, (_, index) =>
    roundMoney((base + (index < remainder ? 1 : 0)) / 100),
  );
}

function pctChange(current: number, previous: number) {
  if (previous <= 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
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
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationService,
  ) {}

  private async checkCategoryBudget(
    userId: string,
    category: { id: string; name: string; budget: unknown },
    monthKey: string,
  ) {
    const budget = Number(category.budget ?? 0);
    if (budget <= 0) return;
    const { start, end } = dateRangeForMonth(monthKey);
    const spent = await this.prisma.monthlyExpense.aggregate({
      where: {
        userId,
        categoryId: category.id,
        status: 'paid',
        OR: [{ monthKey }, { monthKey: null, createdAt: { gte: start, lt: end } }],
      },
      _sum: { amount: true },
    });
    const total = Number(spent._sum.amount ?? 0);
    if (total < budget * 0.8) return;

    const ratio = Math.round((total / budget) * 100);
    await this.notifications.emit(userId, {
      dedupeKey: `budget-${monthKey}-${category.id}`,
      period: NotificationPeriod.MONTHLY,
      category: NotificationCategory.FINANCE,
      kind: NotificationKind.ALERT,
      priority: total >= budget ? NotificationPriority.URGENT : NotificationPriority.NORMAL,
      title:
        total >= budget
          ? `"${category.name}" budget exceeded`
          : `"${category.name}" budget near limit`,
      body: `You used ${total.toFixed(2)} of ${budget.toFixed(2)} USDT (${ratio}%) in "${category.name}" this month.`,
      href: '/monthly-expenses',
      ctaLabel: 'View expenses',
      metadata: { category: category.name, spent: total, budget, ratio },
    });
  }

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

  private async findInvoiceOrThrow(id: string, userId: string) {
    const found = await this.prisma.creditCardInvoice.findUnique({
      where: { id },
      include: { card: true },
    });
    const invoice = assertResourceExists(found, 'Credit card invoice');
    assertResourceOwner(invoice.userId, userId, 'Credit card invoice');
    return invoice;
  }

  private async findCreditCardPurchaseOrThrow(id: string, userId: string) {
    const found = await this.prisma.creditCardPurchase.findUnique({
      where: { id },
      include: {
        installments: {
          include: { invoice: true },
        },
        card: true,
      },
    });
    const purchase = assertResourceExists(found, 'Credit card purchase');
    assertResourceOwner(purchase.userId, userId, 'Credit card purchase');
    return purchase;
  }

  private async closeExpiredInvoicesForCard(
    tx: Prisma.TransactionClient,
    userId: string,
    cardId: string,
    asOf: Date,
  ) {
    const openInvoices = await tx.creditCardInvoice.findMany({
      where: { userId, cardId, status: 'open' },
      select: { id: true, closingDate: true },
    });
    const expiredIds = openInvoices
      .filter((invoice) => !isInvoiceCycleOpen('open', invoice.closingDate, asOf))
      .map((invoice) => invoice.id);
    if (expiredIds.length === 0) return;
    await tx.creditCardInvoice.updateMany({
      where: { id: { in: expiredIds } },
      data: { status: 'closed' },
    });
  }

  private invoiceAcceptsPurchases(
    invoice: { status: string; closingDate: Date },
    asOf: Date,
  ) {
    return (
      invoice.status === 'open' && isInvoiceCycleOpen(invoice.status, invoice.closingDate, asOf)
    );
  }

  private mapInvoicePaymentStatus(
    invoice: { amount: unknown; paidAmount: unknown },
  ) {
    return invoiceBalance(invoice.amount, invoice.paidAmount) <= 0 ? 'paid' : 'pending';
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

  private previousMonth(monthKey: string) {
    const [yearText, monthText] = monthKey.split('-');
    const base = new Date(Date.UTC(Number(yearText), Number(monthText) - 1, 1));
    base.setUTCMonth(base.getUTCMonth() - 1);
    return monthKeyFromDate(base);
  }

  private async monthTransactionCount(userId: string, monthKey: string) {
    const { start, end } = dateRangeForMonth(monthKey);
    const [manualCount, txCount, invoiceCount] = await Promise.all([
      this.prisma.monthlyExpense.count({
        where: {
          userId,
          OR: [{ monthKey }, { monthKey: null, createdAt: { gte: start, lt: end } }],
        },
      }),
      this.prisma.transaction.count({
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
      }),
      this.prisma.creditCardInvoice.count({
        where: { userId, monthKey },
      }),
    ]);
    return manualCount + txCount + invoiceCount;
  }

  private formatExpenseAccount(
    source: string,
    cardsById: Map<string, { brand: string | null; lastFour: string | null }>,
  ) {
    if (source === MONTHLY_EXPENSE_CASH_SOURCE || source === 'MANUAL') return 'Cash';
    if (source === MONTHLY_EXPENSE_EXTRA_INCOME_SOURCE) return 'Extra income';
    const cardId = cardIdFromExpenseSource(source);
    if (!cardId) return source;
    const card = cardsById.get(cardId);
    if (!card) return 'Card removed';
    const brand = card.brand === 'mastercard' ? 'Mastercard' : 'Visa';
    return `${brand} •••• ${card.lastFour ?? '0000'}`;
  }

  private depositAccountLabel(category: string) {
    if (category === 'DEPOSIT_SALARY') return 'Monthly salary';
    if (category === MONTHLY_EXPENSE_EXTRA_INCOME_SOURCE) return 'Extra income';
    if (category === 'DEPOSIT_CARD') return 'Card';
    return 'Wallet';
  }

  async getSalaryRemaining(userId: string, monthKey?: string) {
    const monthlyIncome = await this.assertMonthlyIncomeConfigured(userId);
    const month = normalizeMonth(monthKey);
    const { start, end } = dateRangeForMonth(month);

    const [manualExpenses, transactionExpenses] = await Promise.all([
      this.prisma.monthlyExpense.findMany({
        where: {
          userId,
          OR: [{ monthKey: month }, { monthKey: null, createdAt: { gte: start, lt: end } }],
        },
        select: {
          amount: true,
          source: true,
          status: true,
        },
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
              ...CARD_INVOICE_PAYMENT_TX_CATEGORIES,
            ],
          },
        },
        select: {
          amount: true,
          displayAmount: true,
          displayCurrency: true,
          fxRate: true,
          category: true,
        },
      }),
    ]);

    const manualSpent = manualExpenses
      .filter((item) => isPaidStatus(item.status))
      .reduce((sum, item) => sum + monthlySpendingImpact(item), 0);
    const transactionSpent = transactionExpenses.reduce((sum, tx) => {
      const category = tx.category ?? '';
      const amountBrl = transactionAmountBrl(tx);
      const amount = WALLET_MONTHLY_REVERSAL_TX_CATEGORIES.has(category)
        ? -Math.abs(amountBrl)
        : Math.abs(amountBrl);
      return sum + monthlySpendingImpact({ amount, source: category });
    }, 0);

    return roundMoney(monthlyIncome - manualSpent - transactionSpent);
  }

  async getSummary(userId: string, query: MonthlyExpensesSummaryQueryDto) {
    const monthlyIncome = await this.assertMonthlyIncomeConfigured(userId);
    await this.ensureSystemCategories(userId);
    const month = normalizeMonth(query.month);
    const { start, end } = dateRangeForMonth(month);
    const limit = query.limit ?? 100;

    const userCards = await this.prisma.card.findMany({
      where: { userId },
      select: { id: true },
    });
    const now = new Date();
    await this.prisma.$transaction(async (tx) => {
      for (const card of userCards) {
        await this.closeExpiredInvoicesForCard(tx, userId, card.id, now);
      }
    });

    const [
      categories,
      manualExpenses,
      transactionExpenses,
      cards,
      creditCardInvoices,
      openCreditCardInvoices,
      creditCardPurchases,
    ] = await Promise.all([
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
      this.prisma.creditCardInvoice.findMany({
        where: { userId, monthKey: month },
        include: {
          card: true,
          installments: {
            include: { purchase: true },
            orderBy: { installmentNumber: 'asc' },
          },
        },
        orderBy: { dueDate: 'asc' },
      }),
      this.prisma.creditCardInvoice.findMany({
        where: { userId, status: { in: ['open', 'closed'] } },
        include: {
          card: true,
          installments: {
            include: { purchase: true },
            orderBy: { installmentNumber: 'asc' },
          },
        },
        orderBy: { dueDate: 'asc' },
      }),
      this.prisma.creditCardPurchase.findMany({
        where: {
          userId,
          purchaseDate: { gte: start, lt: end },
        },
        include: {
          card: true,
          installments: {
            include: { invoice: true },
            orderBy: { installmentNumber: 'asc' },
          },
        },
        orderBy: { purchaseDate: 'desc' },
        take: limit,
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
      categoryId: item.source === MONTHLY_EXPENSE_EXTRA_INCOME_SOURCE ? null : item.categoryId,
      categoryName:
        item.source === MONTHLY_EXPENSE_EXTRA_INCOME_SOURCE
          ? 'Extra income'
          : (item.categoryRef?.name ?? item.category ?? 'Uncategorized'),
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
    const mappedInvoices = creditCardInvoices.map((invoice) => {
      const brand = invoice.card.brand === 'mastercard' ? 'Mastercard' : 'Visa';
      const installmentCount = invoice.installments.length;
      const balance = invoiceBalance(invoice.amount, invoice.paidAmount);
      const title =
        installmentCount > 1
          ? `Card invoice • ${installmentCount} installments`
          : (invoice.installments[0]?.purchase.title ?? 'Card invoice');
      return {
        id: `invoice-${invoice.id}`,
        date: invoice.dueDate.toISOString(),
        title,
        categoryId: null,
        categoryName: 'Card invoice',
        amount: balance,
        account: `${brand} •••• ${invoice.card.lastFour ?? '0000'}`,
        status: this.mapInvoicePaymentStatus(invoice),
        fixed: false,
        source: MONTHLY_EXPENSE_CARD_INVOICE_SOURCE,
        linkedTransactionId: invoice.transactionId,
        editable: false,
        deletable: false,
      };
    });
    const mappedCardPurchases = creditCardPurchases.map((purchase) => {
      const brand = purchase.card.brand === 'mastercard' ? 'Mastercard' : 'Visa';
      const hasPaidInstallment = purchase.installments.some(
        (installment) =>
          installment.status === 'paid' ||
          Number(installment.invoice?.paidAmount ?? 0) > 0,
      );
      return {
        id: `card-purchase-${purchase.id}`,
        date: purchase.purchaseDate.toISOString(),
        title:
          purchase.installmentsCount > 1
            ? `${purchase.title} (${purchase.installmentsCount}x)`
            : purchase.title,
        categoryId: purchase.categoryId,
        categoryName: purchase.category ?? 'Card purchase',
        amount: Number(purchase.amount),
        account: `${brand} •••• ${purchase.card.lastFour ?? '0000'}`,
        status: hasPaidInstallment ? 'paid' : 'pending',
        fixed: false,
        source: 'CARD_PURCHASE',
        linkedTransactionId: null,
        linkedCreditCardPurchaseId: purchase.id,
        editable: false,
        deletable: !hasPaidInstallment,
      };
    });

    const expenseRows = [
      ...mappedManual,
      ...mappedTxExpenses,
      ...mappedInvoices,
      ...mappedCardPurchases,
    ].sort((a, b) => b.date.localeCompare(a.date));

    const paidExpenseRows = expenseRows.filter((item) => isPaidStatus(item.status));
    const spent = roundMoney(
      paidExpenseRows.reduce((sum, item) => sum + monthlySpendingImpact(item), 0),
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
    const [currentTransactionCount, previousTransactionCount] = await Promise.all([
      this.monthTransactionCount(userId, month),
      this.monthTransactionCount(userId, previousMonth),
    ]);
    const vsLastMonth = pctChange(currentTransactionCount, previousTransactionCount);

    const spentByCategory = new Map<string, number>();
    for (const row of paidExpenseRows) {
      const key = row.categoryId ?? row.categoryName;
      if (row.source === MONTHLY_EXPENSE_EXTRA_INCOME_SOURCE) continue;
      spentByCategory.set(
        key,
        (spentByCategory.get(key) ?? 0) + expenseAmountForTotals(row),
      );
    }
    const invoicesByCard = new Map(
      creditCardInvoices.map((invoice) => [invoice.cardId, invoice]),
    );
    const openInvoicesByCard = new Map<string, typeof openCreditCardInvoices>();
    for (const invoice of openCreditCardInvoices) {
      const balance = invoiceBalance(invoice.amount, invoice.paidAmount);
      if (invoice.status !== 'open' && balance <= 0) continue;
      openInvoicesByCard.set(invoice.cardId, [
        ...(openInvoicesByCard.get(invoice.cardId) ?? []),
        invoice,
      ]);
    }
    const mapCardInvoiceVm = (invoice: (typeof creditCardInvoices)[number]) => {
      const balance = invoiceBalance(invoice.amount, invoice.paidAmount);
      return {
        id: invoice.id,
        monthKey: invoice.monthKey,
        dueDate: invoice.dueDate.toISOString(),
        closingDate: invoice.closingDate.toISOString(),
        amount: balance,
        totalAmount: Number(invoice.amount),
        paidAmount: Number(invoice.paidAmount),
        cycleStatus: invoice.status as 'open' | 'closed',
        status: balance <= 0 ? ('paid' as const) : ('open' as const),
        paidAt: invoice.paidAt?.toISOString() ?? null,
      };
    };
    const sortCardInvoices = (items: typeof openCreditCardInvoices) =>
      [...items].sort((a, b) => {
        if (a.status === 'open' && b.status !== 'open') return -1;
        if (b.status === 'open' && a.status !== 'open') return 1;
        return a.dueDate.getTime() - b.dueDate.getTime();
      });
    const currentCycleInvoiceByCard = new Map<string, (typeof openCreditCardInvoices)[number]>();
    for (const [cardId, invoices] of openInvoicesByCard.entries()) {
      const sorted = sortCardInvoices(invoices);
      const current = sorted.find((invoice) => invoice.status === 'open') ?? sorted[0];
      if (current) currentCycleInvoiceByCard.set(cardId, current);
    }

    const [salaryRemaining, currentSalaryRemaining] = await Promise.all([
      this.getSalaryRemaining(userId, month),
      this.getSalaryRemaining(userId, monthKeyFromDate(now)),
    ]);

    return {
      month,
      summary: {
        spent,
        budget,
        remaining: income - spent,
        salaryRemaining,
        currentSalaryRemaining,
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
        holderName: item.holderName ?? 'No cardholder',
        lastFour: item.lastFour ?? '0000',
        brand: item.brand?.toLowerCase() ?? 'visa',
        color: item.color ?? '#1e3a8a',
        limitTotal: Number(item.limitTotal ?? 0),
        limitUsage: Number(item.limitUsage ?? 0),
        type: item.type,
        dueDay: item.dueDay,
        invoice: invoicesByCard.get(item.id)
          ? mapCardInvoiceVm(invoicesByCard.get(item.id)!)
          : currentCycleInvoiceByCard.get(item.id)
          ? mapCardInvoiceVm(currentCycleInvoiceByCard.get(item.id)!)
          : null,
        openInvoices: sortCardInvoices(openInvoicesByCard.get(item.id) ?? []).map(mapCardInvoiceVm),
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
    const isExtraIncome = source === MONTHLY_EXPENSE_EXTRA_INCOME_SOURCE;
    await this.assertExpenseSourceOwner(source, userId);

    const expense = await this.prisma.$transaction(async (tx) => {
      const created = await tx.monthlyExpense.create({
        data: {
          userId,
          title: data.title.trim(),
          amount: Math.abs(data.amount),
          category: isExtraIncome ? null : (category?.name ?? null),
          categoryId: isExtraIncome ? null : category?.id,
          monthKey: month,
          source,
          status: data.status ?? 'paid',
          fixed: false,
          createdAt: when,
        },
      });
      if (isPaidStatus(created.status)) {
        await this.adjustCardUsage(
          tx,
          cardIdFromExpenseSource(created.source),
          Math.abs(Number(created.amount)),
        );
      }
      return created;
    });

    if (category && isPaidStatus(expense.status)) {
      await this.checkCategoryBudget(userId, category, month);
    }

    return expense;
  }

  async createCreditCardPurchase(userId: string, data: CreateCreditCardPurchaseDto) {
    await this.assertMonthlyIncomeConfigured(userId);
    await this.ensureSystemCategories(userId);
    const card = await this.findCardOrThrow(data.cardId, userId);
    const category = data.categoryId
      ? await this.findCategoryOrThrow(data.categoryId, userId)
      : null;
    const purchaseDate = data.date ? new Date(data.date) : new Date();
    const totalAmount = roundMoney(Math.abs(data.amount));
    const installmentsCount = Math.trunc(data.installments);
    if (installmentsCount < 1) {
      throw new BadRequestException('Installments must be at least 1.');
    }
    const limitTotal = Number(card.limitTotal ?? 0);
    const limitUsage = Number(card.limitUsage ?? 0);
    if (limitTotal > 0 && limitUsage + totalAmount > limitTotal) {
      throw new BadRequestException('Insufficient card limit.');
    }
    const dueDay = clampDueDay(card.dueDay);
    const installmentAmounts = splitInstallments(totalAmount, installmentsCount);

    return this.prisma.$transaction(async (tx) => {
      await this.closeExpiredInvoicesForCard(tx, userId, card.id, purchaseDate);

      const purchase = await tx.creditCardPurchase.create({
        data: {
          userId,
          cardId: card.id,
          title: data.title.trim(),
          amount: totalAmount,
          installmentsCount,
          category: category?.name ?? null,
          categoryId: category?.id ?? null,
          purchaseDate,
        },
      });

      const createdInstallments = [];
      for (let index = 0; index < installmentsCount; index += 1) {
        let cycleOffset = index;
        let cycle = resolveCreditCardCycle(purchaseDate, dueDay, cycleOffset);
        let existingInvoice = await tx.creditCardInvoice.findUnique({
          where: { cardId_monthKey: { cardId: card.id, monthKey: cycle.monthKey } },
        });
        while (
          existingInvoice &&
          !this.invoiceAcceptsPurchases(existingInvoice, purchaseDate)
        ) {
          cycleOffset += 1;
          cycle = resolveCreditCardCycle(purchaseDate, dueDay, cycleOffset);
          existingInvoice = await tx.creditCardInvoice.findUnique({
            where: { cardId_monthKey: { cardId: card.id, monthKey: cycle.monthKey } },
          });
        }
        const invoice = existingInvoice
          ? await tx.creditCardInvoice.update({
              where: { id: existingInvoice.id },
              data: { amount: { increment: installmentAmounts[index] } },
            })
          : await tx.creditCardInvoice.create({
              data: {
                userId,
                cardId: card.id,
                monthKey: cycle.monthKey,
                dueDate: cycle.dueDate,
                closingDate: cycle.closingDate,
                amount: installmentAmounts[index],
                status: 'open',
              },
            });
        const installment = await tx.creditCardInstallment.create({
          data: {
            userId,
            cardId: card.id,
            purchaseId: purchase.id,
            invoiceId: invoice.id,
            monthKey: cycle.monthKey,
            dueDate: cycle.dueDate,
            installmentNumber: index + 1,
            installmentsTotal: installmentsCount,
            amount: installmentAmounts[index],
            status: 'open',
          },
        });
        createdInstallments.push(installment);
      }

      await tx.card.update({
        where: { id: card.id },
        data: { limitUsage: limitUsage + totalAmount },
      });

      return { ...purchase, installments: createdInstallments };
    });
  }

  async payCreditCardInvoice(id: string, userId: string, data: PayCreditCardInvoiceDto = {}) {
    const invoice = await this.findInvoiceOrThrow(id, userId);

    const now = new Date();
    return this.prisma.$transaction(async (tx) => {
      await this.closeExpiredInvoicesForCard(tx, userId, invoice.cardId, now);
      const current = await tx.creditCardInvoice.findUniqueOrThrow({
        where: { id: invoice.id },
        include: { card: true },
      });
      const balance = invoiceBalance(current.amount, current.paidAmount);
      if (balance <= 0) {
        throw new BadRequestException('Invoice has no outstanding balance.');
      }
      const paymentAmount =
        data.amount != null ? roundMoney(Math.abs(data.amount)) : balance;
      if (paymentAmount <= 0) {
        throw new BadRequestException('Payment amount must be greater than zero.');
      }
      if (paymentAmount > balance) {
        throw new BadRequestException('Payment exceeds the invoice outstanding balance.');
      }
      const salaryRemaining = await this.getSalaryRemaining(userId, monthKeyFromDate(now));
      if (paymentAmount > salaryRemaining) {
        throw new BadRequestException('Payment exceeds the available monthly salary.');
      }
      const nextPaidAmount = roundMoney(Number(current.paidAmount) + paymentAmount);
      const fullyPaid = nextPaidAmount >= Number(current.amount);

      const transaction = await tx.transaction.create({
        data: {
          userId,
          type: 'EXPENSE',
          amount: paymentAmount,
          displayAmount: paymentAmount,
          displayCurrency: 'BRL',
          description: `Card invoice payment • ${current.card.brand ?? 'Card'} ${current.card.lastFour ?? ''}`.trim(),
          category: FINANCE_TX_CATEGORY.CARD_INVOICE_PAYMENT,
          date: now,
        },
      });
      const paidInvoice = await tx.creditCardInvoice.update({
        where: { id: current.id },
        data: {
          paidAmount: { increment: paymentAmount },
          ...(fullyPaid
            ? { paidAt: current.paidAt ?? now, transactionId: current.transactionId ?? transaction.id }
            : {}),
        },
      });
      if (fullyPaid) {
        await tx.creditCardInstallment.updateMany({
          where: { invoiceId: current.id },
          data: { status: 'paid' },
        });
      }
      const currentUsage = Number(current.card.limitUsage ?? 0);
      await tx.card.update({
        where: { id: current.cardId },
        data: { limitUsage: Math.max(0, roundMoney(currentUsage - paymentAmount)) },
      });
      return paidInvoice;
    });
  }

  async cancelCreditCardPurchase(id: string, userId: string) {
    const purchase = await this.findCreditCardPurchaseOrThrow(id, userId);
    if (
      purchase.installments.some(
        (item) =>
          item.status === 'paid' || Number(item.invoice?.paidAmount ?? 0) > 0,
      )
    ) {
      throw new BadRequestException('Cannot cancel a purchase with paid invoice installments.');
    }
    const invoiceAdjustments = new Map<string, number>();
    for (const installment of purchase.installments) {
      if (!installment.invoiceId) continue;
      invoiceAdjustments.set(
        installment.invoiceId,
        (invoiceAdjustments.get(installment.invoiceId) ?? 0) + Number(installment.amount),
      );
    }
    const amount = Number(purchase.amount ?? 0);

    await this.prisma.$transaction(async (tx) => {
      for (const [invoiceId, adjustment] of invoiceAdjustments.entries()) {
        const invoice = await tx.creditCardInvoice.findUnique({
          where: { id: invoiceId },
          select: { amount: true },
        });
        if (!invoice) continue;
        const nextAmount = roundMoney(Number(invoice.amount ?? 0) - adjustment);
        if (nextAmount <= 0) {
          await tx.creditCardInvoice.delete({ where: { id: invoiceId } });
        } else {
          await tx.creditCardInvoice.update({
            where: { id: invoiceId },
            data: { amount: nextAmount },
          });
        }
      }
      await tx.creditCardPurchase.delete({ where: { id: purchase.id } });
      await tx.card.update({
        where: { id: purchase.cardId },
        data: {
          limitUsage: Math.max(0, roundMoney(Number(purchase.card.limitUsage ?? 0) - amount)),
        },
      });
    });

    return { ok: true };
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
    const isExtraIncome = nextSource === MONTHLY_EXPENSE_EXTRA_INCOME_SOURCE;
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
                categoryId: isExtraIncome ? null : (category?.id ?? null),
                category: isExtraIncome ? null : (category?.name ?? null),
              }
            : {}),
          ...(isExtraIncome ? { categoryId: null, category: null } : {}),
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
    const month_ = normalizeMonth(month);
    const { start, end } = dateRangeForMonth(month_);

    // Dedicated lightweight path: only the data needed to compute per-category
    // spend. Avoids the cards query, previous-month comparison and full expense
    // row mapping/sorting performed by getSummary.
    const [categories, manualExpenses, transactionExpenses] = await Promise.all([
      this.prisma.monthlyExpenseCategory.findMany({
        where: { userId, isSystem: false },
        orderBy: [{ name: 'asc' }],
      }),
      this.prisma.monthlyExpense.findMany({
        where: {
          userId,
          status: 'paid',
          OR: [{ monthKey: month_ }, { monthKey: null, createdAt: { gte: start, lt: end } }],
        },
        select: {
          amount: true,
          source: true,
          categoryId: true,
          category: true,
        },
      }),
      this.prisma.transaction.findMany({
        where: {
          userId,
          date: { gte: start, lt: end },
          category: { in: [...FINANCIAL_GOAL_EXPENSE_TX_CATEGORIES] },
        },
        select: {
          amount: true,
          displayAmount: true,
          displayCurrency: true,
          fxRate: true,
          category: true,
        },
      }),
    ]);

    const financialGoalsCategory = await this.prisma.monthlyExpenseCategory.findFirst({
      where: { userId, systemKey: 'FINANCIAL_GOALS' },
      select: { id: true, name: true },
    });

    const spentByCategory = new Map<string, number>();
    const addSpend = (key: string | null | undefined, value: number) => {
      if (!key) return;
      spentByCategory.set(key, (spentByCategory.get(key) ?? 0) + value);
    };

    for (const item of manualExpenses) {
      if (item.source === MONTHLY_EXPENSE_EXTRA_INCOME_SOURCE) continue;
      addSpend(item.categoryId ?? item.category, expenseAmountForTotals(item));
    }
    for (const tx of transactionExpenses) {
      const amountBrl = Math.abs(transactionAmountBrl(tx));
      addSpend(financialGoalsCategory?.id ?? financialGoalsCategory?.name, amountBrl);
    }

    return categories.map((item) => ({
      id: item.id,
      name: item.name,
      budget: Number(item.budget),
      spent: clampMoney(spentByCategory.get(item.id) ?? spentByCategory.get(item.name) ?? 0),
      isSystem: false,
      isLocked: false,
      systemKey: null,
    }));
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
      holderName: item.holderName ?? 'No cardholder',
      lastFour: item.lastFour ?? '0000',
      brand: item.brand?.toLowerCase() ?? 'visa',
      color: item.color ?? '#1e3a8a',
      limitTotal: Number(item.limitTotal ?? 0),
      limitUsage: Number(item.limitUsage ?? 0),
      type: item.type,
      dueDay: item.dueDay,
      invoice: null,
      openInvoices: [],
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
        dueDay: data.dueDay ?? 10,
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
        ...(data.dueDay !== undefined ? { dueDay: data.dueDay } : {}),
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
