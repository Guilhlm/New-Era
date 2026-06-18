'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { toastAuthError, toastUpdated } from '@/lib/app-toast';
import { queryKeys } from '@/lib/query-keys';
import {
  createMonthlyExpense,
  createMonthlyExpenseCard,
  createMonthlyExpenseCategory,
  deleteMonthlyExpense,
  deleteMonthlyExpenseCard,
  deleteMonthlyExpenseCategory,
  deleteTransaction,
  getMonthlyExpenses,
  updateMonthlyExpense,
  updateMonthlyExpenseCard,
  updateMonthlyExpenseCategory,
} from '@/services/finance';
import { HttpError } from '@/services/http';
import type {
  CreateMonthlyExpenseCardInput,
  CreateMonthlyExpenseCategoryInput,
  CreateMonthlyExpenseInput,
  UpdateMonthlyExpenseCardInput,
  UpdateMonthlyExpenseCategoryInput,
  UpdateMonthlyExpenseInput,
} from '@/types/finance';

function monthKeyFromDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function formatMonthLabel(date: Date) {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

function formatMonthShort(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short' }).replace('.', '');
}

function formatExpenseDate(dateIso: string) {
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) return dateIso;
  return date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit' });
}

function displayExpenseAmount(item: { amount: number; source: string }) {
  if (item.source === 'DEPOSIT_EXTRA_INCOME') return Math.abs(item.amount);
  if (item.source === 'WITHDRAW') return Math.abs(item.amount);
  if (item.source === 'ADJUSTMENT' && item.amount < 0) return Math.abs(item.amount);
  return -Math.abs(item.amount);
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

  const [saving, setSaving] = useState(false);

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

  const createExpenseMutation = useMutation({
    mutationFn: (input: CreateMonthlyExpenseInput) => createMonthlyExpense(input),
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

  async function runMutation<T>(
    action: () => Promise<T>,
    successMessage: string,
  ): Promise<T | { error: string }> {
    setSaving(true);
    try {
      const result = await action();
      await invalidateMonthlyCaches();
      toastUpdated(successMessage);
      return result;
    } catch (error) {
      const message = error instanceof HttpError ? error.message : 'Request failed.';
      toastAuthError(message);
      return { error: message };
    } finally {
      setSaving(false);
    }
  }

  const record = summaryQuery.data;
  const totals = record?.summary ?? {
    spent: 0,
    budget: 0,
    remaining: 0,
    vsLastMonth: 0,
    income: 0,
    cardLimit: 0,
    fixedCommitments: 0,
  };

  const expenses = useMemo(
    () =>
      (record?.expenses ?? []).map((item) => ({
        id: item.id,
        date: formatExpenseDate(item.date),
        categoryId: item.categoryId ?? undefined,
        category: item.categoryName,
        description: item.title,
        account: item.account,
        amount: displayExpenseAmount(item),
        status: item.status,
        editable: item.editable,
        deletable: item.deletable ?? item.editable,
        linkedTransactionId: item.linkedTransactionId,
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
      expenses,
      categories,
      cards,
    },
    actions: {
      prevMonth: () =>
        setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)),
      nextMonth: () =>
        setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)),
      createExpense: (input: CreateMonthlyExpenseInput) =>
        runMutation(() => createExpenseMutation.mutateAsync(input), 'Expense created.'),
      updateExpense: (id: string, input: UpdateMonthlyExpenseInput) =>
        runMutation(
          () => updateExpenseMutation.mutateAsync({ id, input }),
          'Expense updated.',
        ),
      deleteExpense: (id: string, linkedTransactionId?: string | null) => {
        if (linkedTransactionId) {
          return runMutation(
            () => deleteTransactionMutation.mutateAsync(linkedTransactionId),
            'Transaction removed.',
          );
        }
        return runMutation(() => deleteExpenseMutation.mutateAsync(id), 'Expense removed.');
      },
      createCategory: (input: CreateMonthlyExpenseCategoryInput) =>
        runMutation(
          () => createCategoryMutation.mutateAsync(input),
          'Category created.',
        ),
      updateCategory: (id: string, input: UpdateMonthlyExpenseCategoryInput) =>
        runMutation(
          () => updateCategoryMutation.mutateAsync({ id, input }),
          'Category updated.',
        ),
      deleteCategory: (id: string) =>
        runMutation(
          () => deleteCategoryMutation.mutateAsync(id),
          'Category removed.',
        ),
      createCard: (input: CreateMonthlyExpenseCardInput) =>
        runMutation(() => createCardMutation.mutateAsync(input), 'Card created.'),
      updateCard: (id: string, input: UpdateMonthlyExpenseCardInput) =>
        runMutation(() => updateCardMutation.mutateAsync({ id, input }), 'Card updated.'),
      deleteCard: (id: string) =>
        runMutation(() => deleteCardMutation.mutateAsync(id), 'Card removed.'),
    },
    ui: {
      loading: summaryQuery.isPending,
      saving,
      error:
        summaryQuery.error instanceof HttpError
          ? summaryQuery.error.message
          : summaryQuery.error
            ? 'Failed to load expenses.'
            : null,
    },
  };
}
