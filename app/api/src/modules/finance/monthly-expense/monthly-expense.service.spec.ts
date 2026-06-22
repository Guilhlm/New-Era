import { Test } from '@nestjs/testing';
import { PrismaService } from '../../../prisma/prisma.service';
import { NotificationService } from '../../notification/notification.service';
import { MonthlyExpenseService } from './monthly-expense.service';

describe('MonthlyExpenseService', () => {
  let service: MonthlyExpenseService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({ monthlyIncome: 5000 }),
      },
      monthlyExpenseCategory: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'system-category',
          userId: 'user-1',
          name: 'Investments',
          budget: 0,
          isSystem: true,
          isLocked: true,
          systemKey: 'INVESTMENTS',
        }),
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'investments',
            name: 'Investments',
            budget: 0,
            isSystem: true,
            isLocked: true,
            systemKey: 'INVESTMENTS',
          },
        ]),
        create: jest.fn(),
        update: jest.fn(),
      },
      monthlyExpense: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
      transaction: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn(),
      },
      card: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      creditCardInvoice: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
        findUnique: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
      creditCardPurchase: {
        create: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
        delete: jest.fn(),
      },
      creditCardInstallment: {
        create: jest.fn(),
        updateMany: jest.fn(),
      },
      $transaction: jest.fn(async (callback: (tx: any) => Promise<unknown>) => callback(prisma)),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        MonthlyExpenseService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationService, useValue: { emit: jest.fn() } },
      ],
    }).compile();

    service = moduleRef.get(MonthlyExpenseService);
  });

  it('does not count registered positions as monthly investment expenses', async () => {
    await service.getSummary('user-1', { month: '2026-06' });

    expect(prisma.transaction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          category: {
            in: expect.not.arrayContaining(['POSITION_REGISTER']),
          },
        }),
      }),
    );
  });

  it('counts extra income as a positive monthly spending impact', async () => {
    prisma.monthlyExpense.findMany.mockResolvedValueOnce([
      {
        id: 'expense-1',
        userId: 'user-1',
        title: 'Groceries',
        amount: 1000,
        categoryId: null,
        category: null,
        categoryRef: null,
        source: 'CASH',
        status: 'paid',
        fixed: false,
        transactionId: null,
        createdAt: new Date('2026-06-10T00:00:00.000Z'),
      },
      {
        id: 'income-1',
        userId: 'user-1',
        title: 'Freelance',
        amount: 200,
        categoryId: null,
        category: null,
        categoryRef: null,
        source: 'DEPOSIT_EXTRA_INCOME',
        status: 'paid',
        fixed: false,
        transactionId: null,
        createdAt: new Date('2026-06-11T00:00:00.000Z'),
      },
    ]);

    const result = await service.getSummary('user-1', { month: '2026-06' });

    expect(result.summary.spent).toBe(800);
    expect(result.summary.remaining).toBe(4200);
    expect(result.expenses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'income-1',
          categoryName: 'Extra income',
          account: 'Extra income',
          amount: 200,
        }),
      ]),
    );
  });

  it('counts wallet deposits from monthly salary as monthly spending', async () => {
    prisma.transaction.findMany.mockResolvedValueOnce([
      {
        id: 'tx-1',
        userId: 'user-1',
        type: 'INCOME',
        amount: 500,
        displayAmount: 500,
        displayCurrency: 'BRL',
        fxRate: 5,
        description: 'Deposit (MONTHLY_SALARY)',
        category: 'DEPOSIT_SALARY',
        date: new Date('2026-06-12T00:00:00.000Z'),
        fromWalletId: null,
        toWalletId: 'wallet-1',
      },
    ]);

    const result = await service.getSummary('user-1', { month: '2026-06' });

    expect(result.summary.spent).toBe(500);
    expect(result.summary.remaining).toBe(4500);
    expect(result.expenses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'tx-tx-1',
          categoryName: 'Wallet',
          account: 'Monthly salary',
          amount: 500,
        }),
      ]),
    );
  });

  it('lists current-month card purchases as cancellable transaction rows', async () => {
    prisma.creditCardPurchase.findMany.mockResolvedValueOnce([
      {
        id: 'purchase-1',
        userId: 'user-1',
        cardId: 'card-1',
        title: 'Mouse',
        amount: 120,
        installmentsCount: 2,
        category: 'Shopping',
        categoryId: 'category-1',
        purchaseDate: new Date('2026-06-19T00:00:00.000Z'),
        card: { brand: 'visa', lastFour: '1111' },
        installments: [
          { invoice: { status: 'open' } },
          { invoice: { status: 'open' } },
        ],
      },
    ]);

    const result = await service.getSummary('user-1', { month: '2026-06' });

    expect(result.expenses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'card-purchase-purchase-1',
          title: 'Mouse (2x)',
          categoryName: 'Shopping',
          linkedCreditCardPurchaseId: 'purchase-1',
          deletable: true,
        }),
      ]),
    );
  });

  it('calculates salary remaining after wallet deposits', async () => {
    prisma.monthlyExpense.findMany.mockResolvedValueOnce([
      {
        amount: 1000,
        source: 'CASH',
        status: 'paid',
      },
    ]);
    prisma.transaction.findMany.mockResolvedValueOnce([
      {
        amount: 100,
        displayAmount: 500,
        displayCurrency: 'BRL',
        fxRate: 5,
        category: 'DEPOSIT_SALARY',
      },
    ]);

    await expect(service.getSalaryRemaining('user-1', '2026-06')).resolves.toBe(3500);
  });

  it('creates installments and invoices for a credit card purchase using billing cycle', async () => {
    prisma.card.findUnique.mockResolvedValue({
      id: 'card-1',
      userId: 'user-1',
      limitTotal: 2000,
      limitUsage: 100,
      dueDay: 10,
    });
    prisma.creditCardPurchase.create.mockResolvedValue({
      id: 'purchase-1',
      userId: 'user-1',
      cardId: 'card-1',
      amount: 300,
      installmentsCount: 3,
    });
    prisma.creditCardInvoice.findUnique.mockResolvedValue(null);
    prisma.creditCardInvoice.create
      .mockResolvedValueOnce({ id: 'invoice-1' })
      .mockResolvedValueOnce({ id: 'invoice-2' })
      .mockResolvedValueOnce({ id: 'invoice-3' });
    prisma.creditCardInstallment.create
      .mockResolvedValueOnce({ id: 'installment-1' })
      .mockResolvedValueOnce({ id: 'installment-2' })
      .mockResolvedValueOnce({ id: 'installment-3' });

    await service.createCreditCardPurchase('user-1', {
      title: 'Notebook',
      amount: 300,
      cardId: 'card-1',
      installments: 3,
      date: '2026-06-05T00:00:00.000Z',
    });

    expect(prisma.creditCardInvoice.create).toHaveBeenCalledTimes(3);
    expect(prisma.creditCardInvoice.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          monthKey: '2026-07',
          closingDate: expect.any(Date),
          status: 'open',
        }),
      }),
    );
    expect(prisma.creditCardInstallment.create).toHaveBeenCalledTimes(3);
    expect(prisma.card.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'card-1' },
        data: { limitUsage: 400 },
      }),
    );
  });

  it('moves new purchases to the next open cycle when the target invoice is closed', async () => {
    prisma.card.findUnique.mockResolvedValue({
      id: 'card-1',
      userId: 'user-1',
      limitTotal: 2000,
      limitUsage: 100,
      dueDay: 10,
    });
    prisma.creditCardPurchase.create.mockResolvedValue({
      id: 'purchase-1',
      userId: 'user-1',
      cardId: 'card-1',
      amount: 100,
      installmentsCount: 1,
    });
    prisma.creditCardInvoice.findUnique
      .mockResolvedValueOnce({
        id: 'closed-invoice',
        status: 'closed',
        closingDate: new Date('2026-05-31T00:00:00.000Z'),
      })
      .mockResolvedValueOnce(null);
    prisma.creditCardInvoice.create.mockResolvedValueOnce({ id: 'next-invoice' });
    prisma.creditCardInstallment.create.mockResolvedValueOnce({ id: 'installment-1' });

    await service.createCreditCardPurchase('user-1', {
      title: 'Groceries',
      amount: 100,
      cardId: 'card-1',
      installments: 1,
      date: '2026-06-05T00:00:00.000Z',
    });

    expect(prisma.creditCardInvoice.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          monthKey: '2026-08',
        }),
      }),
    );
  });

  it('rejects invoice payment above available salary', async () => {
    prisma.creditCardInvoice.findUnique.mockResolvedValue({
      id: 'invoice-1',
      userId: 'user-1',
      cardId: 'card-1',
      monthKey: '2026-06',
      amount: 6000,
      paidAmount: 0,
      status: 'open',
      closingDate: new Date('2026-06-28T00:00:00.000Z'),
      card: { brand: 'visa', lastFour: '4444', limitUsage: 6000 },
    });
    prisma.creditCardInvoice.findUniqueOrThrow.mockResolvedValue({
      id: 'invoice-1',
      userId: 'user-1',
      cardId: 'card-1',
      monthKey: '2026-06',
      amount: 6000,
      paidAmount: 0,
      status: 'open',
      closingDate: new Date('2026-06-28T00:00:00.000Z'),
      card: { brand: 'visa', lastFour: '4444', limitUsage: 6000 },
    });

    await expect(service.payCreditCardInvoice('invoice-1', 'user-1')).rejects.toThrow(
      'Payment exceeds the available monthly salary.',
    );
  });

  it('pays an open invoice partially and releases card limit proportionally', async () => {
    prisma.creditCardInvoice.findUnique.mockResolvedValue({
      id: 'invoice-1',
      userId: 'user-1',
      cardId: 'card-1',
      monthKey: '2026-06',
      amount: 300,
      paidAmount: 0,
      status: 'open',
      closingDate: new Date('2026-06-28T00:00:00.000Z'),
      card: { brand: 'visa', lastFour: '4444', limitUsage: 500 },
    });
    prisma.creditCardInvoice.findUniqueOrThrow.mockResolvedValue({
      id: 'invoice-1',
      userId: 'user-1',
      cardId: 'card-1',
      monthKey: '2026-06',
      amount: 300,
      paidAmount: 0,
      status: 'open',
      closingDate: new Date('2026-06-28T00:00:00.000Z'),
      card: { brand: 'visa', lastFour: '4444', limitUsage: 500 },
    });
    prisma.transaction.create.mockResolvedValue({ id: 'tx-1' });
    prisma.creditCardInvoice.update.mockResolvedValue({ id: 'invoice-1', paidAmount: 100 });

    await service.payCreditCardInvoice('invoice-1', 'user-1', { amount: 100 });

    expect(prisma.creditCardInvoice.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'invoice-1' },
        data: expect.objectContaining({ paidAmount: { increment: 100 } }),
      }),
    );
    expect(prisma.creditCardInstallment.updateMany).not.toHaveBeenCalled();
    expect(prisma.card.update).toHaveBeenCalledWith({
      where: { id: 'card-1' },
      data: { limitUsage: 400 },
    });
  });

  it('marks installments paid when the invoice is fully settled', async () => {
    prisma.creditCardInvoice.findUnique.mockResolvedValue({
      id: 'invoice-1',
      userId: 'user-1',
      cardId: 'card-1',
      monthKey: '2026-06',
      amount: 300,
      paidAmount: 0,
      status: 'open',
      closingDate: new Date('2026-06-28T00:00:00.000Z'),
      card: { brand: 'visa', lastFour: '4444', limitUsage: 500 },
    });
    prisma.creditCardInvoice.findUniqueOrThrow.mockResolvedValue({
      id: 'invoice-1',
      userId: 'user-1',
      cardId: 'card-1',
      monthKey: '2026-06',
      amount: 300,
      paidAmount: 0,
      status: 'open',
      closingDate: new Date('2026-06-28T00:00:00.000Z'),
      card: { brand: 'visa', lastFour: '4444', limitUsage: 500 },
    });
    prisma.transaction.create.mockResolvedValue({ id: 'tx-1' });
    prisma.creditCardInvoice.update.mockResolvedValue({ id: 'invoice-1', paidAmount: 300 });

    await service.payCreditCardInvoice('invoice-1', 'user-1');

    expect(prisma.creditCardInstallment.updateMany).toHaveBeenCalledWith({
      where: { invoiceId: 'invoice-1' },
      data: { status: 'paid' },
    });
  });

  it('cancels an unpaid card purchase and removes it from invoices', async () => {
    prisma.creditCardPurchase.findUnique.mockResolvedValue({
      id: 'purchase-1',
      userId: 'user-1',
      cardId: 'card-1',
      amount: 300,
      card: { limitUsage: 500 },
      installments: [
        {
          amount: 100,
          invoiceId: 'invoice-1',
          invoice: { id: 'invoice-1', status: 'open' },
        },
        {
          amount: 200,
          invoiceId: 'invoice-2',
          invoice: { id: 'invoice-2', status: 'open' },
        },
      ],
    });
    prisma.creditCardInvoice.findUnique
      .mockResolvedValueOnce({ amount: 100 })
      .mockResolvedValueOnce({ amount: 300 });

    await service.cancelCreditCardPurchase('purchase-1', 'user-1');

    expect(prisma.creditCardInvoice.delete).toHaveBeenCalledWith({ where: { id: 'invoice-1' } });
    expect(prisma.creditCardInvoice.update).toHaveBeenCalledWith({
      where: { id: 'invoice-2' },
      data: { amount: 100 },
    });
    expect(prisma.creditCardPurchase.delete).toHaveBeenCalledWith({
      where: { id: 'purchase-1' },
    });
    expect(prisma.card.update).toHaveBeenCalledWith({
      where: { id: 'card-1' },
      data: { limitUsage: 200 },
    });
  });
});
