'use client';

import { useQueryClient } from '@tanstack/react-query';
import { toastAuthError, toastUpdated } from '@/lib/app-toast';
import { queryKeys } from '@/lib/query-keys';
import {
  deleteInvestment,
  depositFunds,
  registerPosition,
  tradeMarket,
  withdrawFunds,
} from '@/services/finance';
import { HttpError } from '@/services/http';
import type {
  DepositFundsInput,
  FinanceSummaryRecord,
  MarketTradeInput,
  MonthlyExpensesSummaryRecord,
  QuoteCurrency,
  RegisterPositionInput,
  WithdrawFundsInput,
} from '@/types/finance';
import type { WalletInvestmentTab, WalletPerformancePeriod } from '@/types/wallet';
import { CRUD_TOAST } from '@/utils/crud-toast-messages';
import { currentMonthKey } from '@/utils/month-key';

function formatWalletMutationError(message: string): string {
  switch (message) {
    case 'Insufficient wallet balance.':
      return 'Insufficient balance. Deposit funds before buying.';
    case 'Market price unavailable for this asset.':
      return 'Quote unavailable. Wait for the market update and try again.';
    case 'Insufficient shares.':
      return 'Insufficient shares to sell.';
    case 'No position to sell.':
      return 'You do not hold a position in this asset.';
    case 'Wallet salary deposits must be in BRL.':
      return 'Wallet deposits must be made in BRL.';
    case 'Wallet withdrawals must be in BRL.':
      return 'Wallet withdrawals must be made in BRL.';
    case 'Deposit exceeds the available monthly salary.':
      return 'Deposit exceeds your available salary for this month.';
    default:
      if (message.includes('shares must not be less than')) {
        return 'Quantity below the minimum allowed (0.000001).';
      }
      if (message.includes('budgetUsdt must not be greater than')) {
        return 'Purchase amount exceeds the allowed limit. Check the USDT value.';
      }
      if (message.includes('amount must not be greater than')) {
        return 'Amount exceeds the allowed limit. Use "Withdraw all" or check the selected currency.';
      }
      return message;
  }
}

function patchWalletSummaryCash(
  summary: FinanceSummaryRecord | undefined,
  input: DepositFundsInput,
  amountUsdt: number,
  mode: 'deposit' | 'withdraw',
): FinanceSummaryRecord | undefined {
  if (!summary) return summary;

  const delta = mode === 'deposit' ? amountUsdt : -amountUsdt;
  const walletCashAvailable = Math.max(0, summary.walletCashAvailable + delta);
  const walletTotal = Math.max(0, summary.walletTotal + delta);
  const totalBalance = Math.max(0, summary.totalBalance + delta);
  const investedPctOfTotal = totalBalance > 0 ? (summary.investedTotal / totalBalance) * 100 : 0;
  const availablePctOfTotal = totalBalance > 0 ? (walletCashAvailable / totalBalance) * 100 : 0;
  const title = mode === 'deposit' ? 'Deposit' : 'Withdraw';
  const source = mode === 'deposit' ? (input.source ?? 'MONTHLY_SALARY') : 'WITHDRAW';
  const currency = input.currency ?? 'USDT';
  const subtitle =
    mode === 'deposit'
      ? `Deposit (${source})`
      : `Withdraw • ${input.amount.toFixed(2)} ${currency}`;
  const optimisticTransaction = {
    id: `optimistic-${mode}-${Date.now()}`,
    title,
    subtitle,
    amount: delta,
  };

  return {
    ...summary,
    totalBalance,
    walletCashAvailable,
    walletTotal,
    investedPctOfTotal,
    availablePctOfTotal,
    allocation: {
      ...summary.allocation,
      segments: summary.allocation.segments.map((segment) => {
        const value = segment.key === 'wallet' ? Math.max(0, segment.value + delta) : segment.value;
        return {
          ...segment,
          value,
          pct: totalBalance > 0 ? (value / totalBalance) * 100 : 0,
        };
      }),
    },
    recentTransactions: [
      optimisticTransaction,
      ...summary.recentTransactions.filter((item) => !item.id.startsWith(`optimistic-${mode}-`)),
    ].slice(0, 10),
  };
}

function patchMonthlyCashFlow(
  record: MonthlyExpensesSummaryRecord | undefined,
  input: DepositFundsInput,
  amountUsdt: number,
  mode: 'deposit' | 'withdraw',
): MonthlyExpensesSummaryRecord | undefined {
  if (!record || record.month !== currentMonthKey()) return record;

  const amount = input.currency === 'BRL' ? input.amount : amountUsdt;
  const spentDelta = mode === 'deposit' ? amount : -amount;
  const source = mode === 'deposit' ? 'DEPOSIT_SALARY' : 'WITHDRAW';
  const transaction = {
    id: `optimistic-monthly-${mode}-${Date.now()}`,
    date: new Date().toISOString(),
    title: mode === 'deposit' ? 'Deposit (MONTHLY_SALARY)' : 'Wallet withdrawal',
    categoryId: null,
    categoryName: 'Wallet',
    amount: mode === 'deposit' ? Math.abs(amount) : -Math.abs(amount),
    account: mode === 'deposit' ? 'Monthly salary' : 'Withdrawal',
    status: 'paid' as const,
    fixed: false,
    source,
    linkedTransactionId: null,
    editable: false,
    deletable: false,
  };
  const spent = Number((record.summary.spent + spentDelta).toFixed(2));

  return {
    ...record,
    summary: {
      ...record.summary,
      spent,
      remaining: Number((record.summary.income - spent).toFixed(2)),
    },
    expenses: [
      transaction,
      ...record.expenses.filter((item) => !item.id.startsWith(`optimistic-monthly-${mode}-`)),
    ],
  };
}

export function useWalletMutations(options?: {
  investmentTab?: WalletInvestmentTab;
  performancePeriod?: WalletPerformancePeriod;
  currency?: QuoteCurrency;
}) {
  const queryClient = useQueryClient();
  const investmentTab = options?.investmentTab ?? 'stocks';
  const performancePeriod = options?.performancePeriod ?? '1W';
  const currency = options?.currency ?? 'USDT';

  async function invalidateInvestmentCaches() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.walletSummary(performancePeriod) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.walletInvestments(investmentTab) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.walletMarket(investmentTab, currency) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.walletMarket(investmentTab, 'USDT') }),
      queryClient.invalidateQueries({ queryKey: queryKeys.walletMarket(investmentTab, 'BRL') }),
      queryClient.invalidateQueries({ queryKey: queryKeys.wallets }),
      queryClient.invalidateQueries({ queryKey: queryKeys.monthlyExpensesAll }),
      queryClient.invalidateQueries({ queryKey: queryKeys.me }),
    ]);
  }

  function invalidateCashCaches() {
    void Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.walletSummaryAll }),
      queryClient.invalidateQueries({ queryKey: queryKeys.wallets }),
      queryClient.invalidateQueries({ queryKey: queryKeys.monthlyExpensesAll }),
      queryClient.invalidateQueries({ queryKey: queryKeys.me }),
    ]);
  }

  async function runMutation<T>(action: () => Promise<T>, successMessage: string) {
    try {
      const result = await action();
      await invalidateInvestmentCaches();
      toastUpdated(successMessage);
      return result;
    } catch (error) {
      toastAuthError(
        error instanceof HttpError
          ? formatWalletMutationError(error.message)
          : 'Request failed.',
      );
      throw error;
    }
  }

  return {
    registerPosition: (input: RegisterPositionInput) =>
      runMutation(() => registerPosition(input), CRUD_TOAST.positionRegistered),
    deleteInvestment: (id: string) =>
      runMutation(() => deleteInvestment(id), CRUD_TOAST.investmentDeleted),
    tradeMarket: (input: MarketTradeInput) =>
      runMutation(() => tradeMarket(input), CRUD_TOAST.tradeRecorded),
    depositFunds: async (input: DepositFundsInput) => {
      try {
        const result = await depositFunds(input);
        queryClient.setQueriesData<FinanceSummaryRecord>(
          { queryKey: queryKeys.walletSummaryAll },
          (summary) => patchWalletSummaryCash(summary, input, result.amountUsdt, 'deposit'),
        );
        queryClient.setQueriesData<MonthlyExpensesSummaryRecord>(
          { queryKey: queryKeys.monthlyExpensesAll },
          (record) => patchMonthlyCashFlow(record, input, result.amountUsdt, 'deposit'),
        );
        invalidateCashCaches();
        toastUpdated(CRUD_TOAST.fundsDeposited);
        return result;
      } catch (error) {
        toastAuthError(
          error instanceof HttpError
            ? formatWalletMutationError(error.message)
            : 'Request failed.',
        );
        throw error;
      }
    },
    withdrawFunds: async (input: WithdrawFundsInput) => {
      try {
        const result = await withdrawFunds(input);
        queryClient.setQueriesData<FinanceSummaryRecord>(
          { queryKey: queryKeys.walletSummaryAll },
          (summary) => patchWalletSummaryCash(summary, input, result.amountUsdt, 'withdraw'),
        );
        queryClient.setQueriesData<MonthlyExpensesSummaryRecord>(
          { queryKey: queryKeys.monthlyExpensesAll },
          (record) => patchMonthlyCashFlow(record, input, result.amountUsdt, 'withdraw'),
        );
        invalidateCashCaches();
        toastUpdated(CRUD_TOAST.fundsWithdrawn);
        return result;
      } catch (error) {
        toastAuthError(
          error instanceof HttpError
            ? formatWalletMutationError(error.message)
            : 'Request failed.',
        );
        throw error;
      }
    },
  };
}
