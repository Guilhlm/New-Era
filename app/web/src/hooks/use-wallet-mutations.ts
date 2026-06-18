'use client';

import { useQueryClient } from '@tanstack/react-query';
import { toastAuthError, toastUpdated } from '@/lib/app-toast';
import { queryKeys } from '@/lib/query-keys';
import {
  createInvestment,
  deleteInvestment,
  depositFunds,
  registerPosition,
  tradeInvestment,
  tradeMarket,
  updateInvestment,
  withdrawFunds,
} from '@/services/finance';
import { HttpError } from '@/services/http';
import type {
  CreateInvestmentInput,
  DepositFundsInput,
  MarketTradeInput,
  QuoteCurrency,
  RegisterPositionInput,
  TradeInvestmentInput,
  UpdateInvestmentInput,
  WithdrawFundsInput,
} from '@/types/finance';
import type { WalletInvestmentTab, WalletPerformancePeriod } from '@/types/wallet';
import { CRUD_TOAST } from '@/utils/crud-toast-messages';

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

export function useWalletMutations(options?: {
  investmentTab?: WalletInvestmentTab;
  performancePeriod?: WalletPerformancePeriod;
  currency?: QuoteCurrency;
}) {
  const queryClient = useQueryClient();
  const investmentTab = options?.investmentTab ?? 'stocks';
  const performancePeriod = options?.performancePeriod ?? '1W';
  const currency = options?.currency ?? 'USDT';

  async function invalidateWalletCaches() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.walletSummary(performancePeriod) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.walletSummary() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.walletInvestments(investmentTab) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.walletMarket(investmentTab, currency) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.walletMarket(investmentTab, 'USDT') }),
      queryClient.invalidateQueries({ queryKey: queryKeys.walletMarket(investmentTab, 'BRL') }),
      queryClient.invalidateQueries({ queryKey: queryKeys.walletFx }),
      queryClient.invalidateQueries({ queryKey: queryKeys.wallets }),
      queryClient.invalidateQueries({ queryKey: queryKeys.monthlyExpenseCards }),
      queryClient.invalidateQueries({ queryKey: queryKeys.monthlyExpenses() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.me }),
    ]);
  }

  async function runMutation<T>(action: () => Promise<T>, successMessage: string) {
    try {
      const result = await action();
      await invalidateWalletCaches();
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
    createInvestment: (input: CreateInvestmentInput) =>
      runMutation(() => createInvestment(input), CRUD_TOAST.investmentCreated),
    registerPosition: (input: RegisterPositionInput) =>
      runMutation(() => registerPosition(input), CRUD_TOAST.positionRegistered),
    updateInvestment: (id: string, input: UpdateInvestmentInput) =>
      runMutation(() => updateInvestment(id, input), CRUD_TOAST.investmentUpdated),
    deleteInvestment: (id: string) =>
      runMutation(() => deleteInvestment(id), CRUD_TOAST.investmentDeleted),
    tradeInvestment: (id: string, input: TradeInvestmentInput) =>
      runMutation(() => tradeInvestment(id, input), CRUD_TOAST.tradeRecorded),
    tradeMarket: (input: MarketTradeInput) =>
      runMutation(() => tradeMarket(input), CRUD_TOAST.tradeRecorded),
    depositFunds: (input: DepositFundsInput) =>
      runMutation(() => depositFunds(input), CRUD_TOAST.fundsDeposited),
    withdrawFunds: (input: WithdrawFundsInput) =>
      runMutation(() => withdrawFunds(input), CRUD_TOAST.fundsWithdrawn),
  };
}
