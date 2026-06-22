'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { MONTHLY_EXPENSES_COPY as copy } from '@/components/monthly-expenses/monthly-expenses-copy';
import { useDashboardMutation } from '@/hooks/use-dashboard-mutation';
import { queryKeys } from '@/lib/query-keys';
import {
  createMonthlyExpense,
  createMonthlyExpenseCard,
  createMonthlyExpenseCategory,
  createCreditCardPurchase,
  deleteCreditCardPurchase,
  deleteMonthlyExpense,
  deleteMonthlyExpenseCard,
  deleteMonthlyExpenseCategory,
  deleteTransaction,
  getMonthlyExpenses,
  payCreditCardInvoice,
  updateMonthlyExpense,
  updateMonthlyExpenseCard,
  updateMonthlyExpenseCategory,
} from '@/services/finance';
import { HttpError } from '@/services/http';
import type {
  CreateMonthlyExpenseCardInput,
  CreateMonthlyExpenseCategoryInput,
  CreateMonthlyExpenseInput,
  CreateCreditCardPurchaseInput,
  ExpensePaymentSource,
  UpdateMonthlyExpenseCardInput,
  UpdateMonthlyExpenseCategoryInput,
  UpdateMonthlyExpenseInput,
} from '@/types/finance';
import { formatMonthLabel, formatMonthShort, formatShortDate, monthKeyFromDate } from '@/utils/month-key';

function displayExpenseAmount(item: { amount: number; source: string }) {
  if (item.source === 'DEPOSIT_EXTRA_INCOME') return Math.abs(item.amount);
  if (item.source === 'WITHDRAW') return Math.abs(item.amount);
  if (item.source === 'ADJUSTMENT' && item.amount < 0) return Math.abs(item.amount);
  return -Math.abs(item.amount);
}

function resolveCardId(input: CreateMonthlyExpenseInput) {
  if (input.paymentSource === 'CARD' && input.cardId) return input.cardId;
  if (input.account?.startsWith('CARD:')) return input.account.slice('CARD:'.length);
  return null;
}

function resolveExpenseAccount(input: CreateMonthlyExpenseInput) {
  if (input.paymentSource === 'DEPOSIT_EXTRA_INCOME') return 'DEPOSIT_EXTRA_INCOME';
  if (input.paymentSource === 'CASH') return 'CASH';
  if (input.paymentSource === 'CARD' && input.cardId) return `CARD:${input.cardId}`;
  return input.account;
}

export function useMonthlyExpensesDashboardState() {
  const queryClient = useQueryClient();
  const [monthCursor, setMonthCursor] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const monthKey = monthKeyFromDate(monthCursor);

  const summaryQuery = useQuery({
    queryKey: queryKeys.monthlyExpenses(monthKey),
    queryFn: () => getMonthlyExpenses(monthKey),
    staleTime: 20_000,
  });

  async function invalidateMonthlyCaches() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.monthlyExpenses(monthKey) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.monthlyExpenseCategories(monthKey) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.monthlyExpenseCards }),
      queryClient.invalidateQueries({ queryKey: queryKeys.walletSummary() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.financeGoals() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.notificationsUnreadCount }),
    ]);
  }

  const { run, isPending, saving } = useDashboardMutation({
    onSuccess: invalidateMonthlyCaches,
  });

  const createExpenseMutation = useMutation({
    mutationFn: (input: CreateMonthlyExpenseInput) => createMonthlyExpense(input),
  });
  const createCardPurchaseMutation = useMutation({
    mutationFn: (input: CreateCreditCardPurchaseInput) => createCreditCardPurchase(input),
  });
  const updateExpenseMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateMonthlyExpenseInput }) =>
      updateMonthlyExpense(id, input),
  });
  const deleteExpenseMutation = useMutation({
    mutationFn: (id: string) => deleteMonthlyExpense(id),
  });
  const deleteTransactionMutation = useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
  });
  const deleteCardPurchaseMutation = useMutation({
    mutationFn: (id: string) => deleteCreditCardPurchase(id),
  });
  const payCardInvoiceMutation = useMutation({
    mutationFn: ({ id, monthKey, amount }: { id: string; monthKey?: string; amount?: number }) =>
      payCreditCardInvoice(id, { monthKey, amount }),
  });
  const createCategoryMutation = useMutation({
    mutationFn: (input: CreateMonthlyExpenseCategoryInput) =>
      createMonthlyExpenseCategory(input),
  });
  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateMonthlyExpenseCategoryInput }) =>
      updateMonthlyExpenseCategory(id, input),
  });
  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => deleteMonthlyExpenseCategory(id),
  });
  const createCardMutation = useMutation({
    mutationFn: (input: CreateMonthlyExpenseCardInput) => createMonthlyExpenseCard(input),
  });
  const updateCardMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateMonthlyExpenseCardInput }) =>
      updateMonthlyExpenseCard(id, input),
  });
  const deleteCardMutation = useMutation({
    mutationFn: (id: string) => deleteMonthlyExpenseCard(id),
  });

  const record = summaryQuery.data;
  const totals = record?.summary ?? {
    spent: 0,
    budget: 0,
    remaining: 0,
    salaryRemaining: 0,
    currentSalaryRemaining: 0,
    vsLastMonth: 0,
    income: 0,
    cardLimit: 0,
    fixedCommitments: 0,
  };

  const expenses = useMemo(
    () =>
      (record?.expenses ?? []).map((item) => ({
        id: item.id,
        date: formatShortDate(item.date),
        categoryId: item.categoryId ?? undefined,
        category: item.categoryName,
        description: item.title,
        account: item.account,
        amount: displayExpenseAmount(item),
        status: item.status,
        editable: item.editable,
        deletable: item.deletable ?? item.editable,
        linkedTransactionId: item.linkedTransactionId,
        linkedCreditCardPurchaseId: item.linkedCreditCardPurchaseId,
        source: item.source,
      })),
    [record?.expenses],
  );

  const categories = useMemo(
    () =>
      (record?.categories ?? []).map((item) => ({
        id: item.id,
        label: item.name,
        spent: item.spent,
        budget: item.budget,
        isLocked: item.isLocked || item.isSystem,
      })),
    [record?.categories],
  );

  const cards = useMemo(
    () =>
      (record?.cards ?? []).map((item, index) => ({
        id: item.id,
        holder: item.holderName,
        lastFour: item.lastFour,
        limit: item.limitTotal,
        used: item.limitUsage,
        dueDay: item.dueDay,
        invoice: item.invoice,
        openInvoices: item.openInvoices,
        brand: (item.brand === 'mastercard' ? 'mastercard' : 'visa') as 'mastercard' | 'visa',
        color: item.color,
        highlighted: index === 0,
      })),
    [record?.cards],
  );

  return {
    data: {
      monthKey,
      monthLabel: formatMonthLabel(monthCursor),
      monthShortLabel: formatMonthShort(monthCursor),
      totals,
      salaryRemainingForPayment: totals.currentSalaryRemaining ?? totals.salaryRemaining ?? 0,
      expenses,
      categories,
      cards,
    },
    actions: {
      prevMonth: () =>
        setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)),
      nextMonth: () =>
        setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)),
      createExpense: (input: CreateMonthlyExpenseInput) => {
        const cardId = resolveCardId(input);
        if (cardId) {
          return run(
            'expense',
            () =>
              createCardPurchaseMutation.mutateAsync({
                title: input.title,
                amount: input.amount,
                cardId,
                categoryId: input.categoryId,
                date: input.date,
                installments: input.installments ?? 1,
              }),
            copy.toast.cardPurchaseCreated,
          );
        }
        const account = resolveExpenseAccount(input);
        return run(
          'expense',
          () =>
            createExpenseMutation.mutateAsync({
              ...input,
              account,
            }),
          copy.toast.expenseCreated,
        );
      },
      updateExpense: (id: string, input: UpdateMonthlyExpenseInput) =>
        run(
          'expense',
          () => updateExpenseMutation.mutateAsync({ id, input }),
          copy.toast.expenseUpdated,
        ),
      deleteExpense: (
        id: string,
        linkedTransactionId?: string | null,
        linkedCreditCardPurchaseId?: string | null,
      ) => {
        if (linkedCreditCardPurchaseId) {
          return run(
            'expense',
            () => deleteCardPurchaseMutation.mutateAsync(linkedCreditCardPurchaseId),
            copy.toast.cardPurchaseCancelled,
          );
        }
        if (linkedTransactionId) {
          return run(
            'expense',
            () => deleteTransactionMutation.mutateAsync(linkedTransactionId),
            copy.toast.transactionRemoved,
          );
        }
        return run(
          'expense',
          () => deleteExpenseMutation.mutateAsync(id),
          copy.toast.expenseRemoved,
        );
      },
      createCategory: (input: CreateMonthlyExpenseCategoryInput) =>
        run('category', () => createCategoryMutation.mutateAsync(input), copy.toast.categoryCreated),
      updateCategory: (id: string, input: UpdateMonthlyExpenseCategoryInput) =>
        run(
          'category',
          () => updateCategoryMutation.mutateAsync({ id, input }),
          copy.toast.categoryUpdated,
        ),
      deleteCategory: (id: string) =>
        run('category', () => deleteCategoryMutation.mutateAsync(id), copy.toast.categoryRemoved),
      createCard: (input: CreateMonthlyExpenseCardInput) =>
        run('card', () => createCardMutation.mutateAsync(input), copy.toast.cardCreated),
      updateCard: (id: string, input: UpdateMonthlyExpenseCardInput) =>
        run('card', () => updateCardMutation.mutateAsync({ id, input }), copy.toast.cardUpdated),
      deleteCard: (id: string) =>
        run('card', () => deleteCardMutation.mutateAsync(id), copy.toast.cardRemoved),
      payCardInvoice: (id: string) =>
        run('invoice', () => payCardInvoiceMutation.mutateAsync({ id }), copy.toast.invoicePaid),
    },
    ui: {
      loading: summaryQuery.isPending,
      saving,
      isPending,
      error:
        summaryQuery.error instanceof HttpError
          ? summaryQuery.error.message
          : summaryQuery.error
            ? copy.loadError
            : null,
    },
  };
}

export type ExpensePaymentSourceOption = ExpensePaymentSource;
