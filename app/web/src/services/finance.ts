import type {
  CreateFinancialGoalInput,
  CreateInvestmentInput,
  CreateMonthlyExpenseCardInput,
  CreateMonthlyExpenseCategoryInput,
  CreateMonthlyExpenseInput,
  DepositFundsInput,
  FinancialGoalRecord,
  FinancialGoalsListRecord,
  FinanceSummaryRecord,
  FxRateRecord,
  InvestmentRecord,
  MarketAssetRowRecord,
  MarketBoardRecord,
  MarketSearchRecord,
  MarketTradeInput,
  MonthlyExpenseCardRecord,
  MonthlyExpenseCategoryRecord,
  MonthlyExpenseRecord,
  MonthlyExpensesSummaryRecord,
  NotificationsResponseRecord,
  QuoteCurrency,
  RegisterPositionInput,
  TradeInvestmentInput,
  UpdateFinancialGoalInput,
  UpdateFinancialGoalProgressInput,
  UpdateInvestmentInput,
  UpdateMonthlyExpenseCardInput,
  UpdateMonthlyExpenseCategoryInput,
  UpdateMonthlyExpenseInput,
  WithdrawFundsInput,
  WalletRecord,
} from '@/types/finance';
import type { WalletInvestmentTab, WalletPerformancePeriod } from '@/types/wallet';
import { deleteJson, getJson, patchJson, postJson } from '@/services/http';

export function getFinanceSummary(period: WalletPerformancePeriod = '1W') {
  return getJson<FinanceSummaryRecord>(`/api/finance/summary?period=${period}`, {
    cache: 'no-store',
    credentials: 'include',
  });
}

export function getFinancePerformance(period: WalletPerformancePeriod = '1W') {
  return getJson<FinanceSummaryRecord['performance']>(
    `/api/finance/summary/performance?period=${period}`,
    {
      cache: 'no-store',
      credentials: 'include',
    },
  );
}

export function getInvestments(tab?: WalletInvestmentTab) {
  const query = tab ? `?tab=${encodeURIComponent(tab)}` : '';
  return getJson<InvestmentRecord[]>(`/api/finance/investments${query}`, {
    cache: 'no-store',
    credentials: 'include',
  });
}

export function getWallets() {
  return getJson<WalletRecord[]>('/api/finance/wallets', {
    cache: 'no-store',
    credentials: 'include',
  });
}

export function createInvestment(input: CreateInvestmentInput) {
  return postJson<InvestmentRecord, CreateInvestmentInput>('/api/finance/investments', input, {
    cache: 'no-store',
    credentials: 'include',
  });
}

export function registerPosition(input: RegisterPositionInput) {
  return postJson<InvestmentRecord, RegisterPositionInput>(
    '/api/finance/investments/register',
    input,
    {
      cache: 'no-store',
      credentials: 'include',
    },
  );
}

export function updateInvestment(id: string, input: UpdateInvestmentInput) {
  return patchJson<InvestmentRecord, UpdateInvestmentInput>(
    `/api/finance/investments/${id}`,
    input,
    {
      cache: 'no-store',
      credentials: 'include',
    },
  );
}

export function deleteInvestment(id: string) {
  return deleteJson<{ ok: true }>(`/api/finance/investments/${id}`, {
    cache: 'no-store',
    credentials: 'include',
  });
}

export function tradeInvestment(id: string, input: TradeInvestmentInput) {
  return postJson<InvestmentRecord, TradeInvestmentInput>(
    `/api/finance/investments/${id}/trade`,
    input,
    {
      cache: 'no-store',
      credentials: 'include',
    },
  );
}

export function depositFunds(input: DepositFundsInput) {
  return postJson<{ ok: true; walletId: string; amountUsdt: number }, DepositFundsInput>(
    '/api/finance/investments/deposit',
    input,
    {
      cache: 'no-store',
      credentials: 'include',
    },
  );
}

export function withdrawFunds(input: WithdrawFundsInput) {
  return postJson<{ ok: true; walletId: string; amountUsdt: number }, WithdrawFundsInput>(
    '/api/finance/investments/withdraw',
    input,
    {
      cache: 'no-store',
      credentials: 'include',
    },
  );
}

export function getMarketBoard(
  tab: WalletInvestmentTab,
  currency: QuoteCurrency = 'USDT',
  offset = 0,
  limit = 20,
) {
  const params = new URLSearchParams({
    tab,
    currency,
    offset: String(offset),
    limit: String(limit),
  });
  return getJson<MarketBoardRecord>(`/api/finance/market?${params.toString()}`, {
    cache: 'no-store',
    credentials: 'include',
  });
}

export function searchMarketAssets(tab: WalletInvestmentTab, query: string) {
  const params = new URLSearchParams({
    tab,
    q: query,
  });
  return getJson<MarketSearchRecord>(`/api/finance/market?${params.toString()}`, {
    cache: 'no-store',
    credentials: 'include',
  });
}

export function getMarketAssetRow(
  tab: WalletInvestmentTab,
  ticker: string,
  currency: QuoteCurrency = 'USDT',
  options?: { coinId?: string; name?: string },
) {
  const params = new URLSearchParams({
    tab,
    ticker,
    currency,
  });
  if (options?.coinId) params.set('coinId', options.coinId);
  if (options?.name) params.set('name', options.name);
  return getJson<MarketAssetRowRecord>(`/api/finance/market/asset?${params.toString()}`, {
    cache: 'no-store',
    credentials: 'include',
  });
}

export function getFxRate() {
  return getJson<FxRateRecord>('/api/finance/market/fx', {
    cache: 'no-store',
    credentials: 'include',
  });
}

export function tradeMarket(input: MarketTradeInput) {
  return postJson<InvestmentRecord, MarketTradeInput>('/api/finance/market/trade', input, {
    cache: 'no-store',
    credentials: 'include',
  });
}

export function getMonthlyExpenses(month?: string) {
  const query = month ? `?month=${encodeURIComponent(month)}` : '';
  return getJson<MonthlyExpensesSummaryRecord>(`/api/finance/monthly-expenses${query}`, {
    cache: 'no-store',
    credentials: 'include',
  });
}

export function createMonthlyExpense(input: CreateMonthlyExpenseInput) {
  return postJson<MonthlyExpenseRecord, CreateMonthlyExpenseInput>(
    '/api/finance/monthly-expenses',
    input,
    {
      cache: 'no-store',
      credentials: 'include',
    },
  );
}

export function updateMonthlyExpense(id: string, input: UpdateMonthlyExpenseInput) {
  return patchJson<MonthlyExpenseRecord, UpdateMonthlyExpenseInput>(
    `/api/finance/monthly-expenses/${id}`,
    input,
    {
      cache: 'no-store',
      credentials: 'include',
    },
  );
}

export function deleteMonthlyExpense(id: string) {
  return deleteJson<{ ok: true }>(`/api/finance/monthly-expenses/${id}`, {
    cache: 'no-store',
    credentials: 'include',
  });
}

export function getMonthlyExpenseCategories(month?: string) {
  const query = month ? `?month=${encodeURIComponent(month)}` : '';
  return getJson<MonthlyExpenseCategoryRecord[]>(
    `/api/finance/monthly-expenses/categories${query}`,
    {
      cache: 'no-store',
      credentials: 'include',
    },
  );
}

export function createMonthlyExpenseCategory(input: CreateMonthlyExpenseCategoryInput) {
  return postJson<MonthlyExpenseCategoryRecord, CreateMonthlyExpenseCategoryInput>(
    '/api/finance/monthly-expenses/categories',
    input,
    {
      cache: 'no-store',
      credentials: 'include',
    },
  );
}

export function updateMonthlyExpenseCategory(
  id: string,
  input: UpdateMonthlyExpenseCategoryInput,
) {
  return patchJson<MonthlyExpenseCategoryRecord, UpdateMonthlyExpenseCategoryInput>(
    `/api/finance/monthly-expenses/categories/${id}`,
    input,
    {
      cache: 'no-store',
      credentials: 'include',
    },
  );
}

export function deleteMonthlyExpenseCategory(id: string) {
  return deleteJson<{ ok: true }>(`/api/finance/monthly-expenses/categories/${id}`, {
    cache: 'no-store',
    credentials: 'include',
  });
}

export function getMonthlyExpenseCards() {
  return getJson<MonthlyExpenseCardRecord[]>('/api/finance/monthly-expenses/cards', {
    cache: 'no-store',
    credentials: 'include',
  });
}

export function createMonthlyExpenseCard(input: CreateMonthlyExpenseCardInput) {
  return postJson<MonthlyExpenseCardRecord, CreateMonthlyExpenseCardInput>(
    '/api/finance/monthly-expenses/cards',
    input,
    {
      cache: 'no-store',
      credentials: 'include',
    },
  );
}

export function updateMonthlyExpenseCard(id: string, input: UpdateMonthlyExpenseCardInput) {
  return patchJson<MonthlyExpenseCardRecord, UpdateMonthlyExpenseCardInput>(
    `/api/finance/monthly-expenses/cards/${id}`,
    input,
    {
      cache: 'no-store',
      credentials: 'include',
    },
  );
}

export function deleteMonthlyExpenseCard(id: string) {
  return deleteJson<{ ok: true }>(`/api/finance/monthly-expenses/cards/${id}`, {
    cache: 'no-store',
    credentials: 'include',
  });
}

export function getFinancialGoals(sort?: 'progress' | 'name' | 'deadline' | 'target') {
  const query = sort ? `?sort=${encodeURIComponent(sort)}` : '';
  return getJson<FinancialGoalsListRecord>(`/api/finance/goals${query}`, {
    cache: 'no-store',
    credentials: 'include',
  });
}

export function createFinancialGoal(input: CreateFinancialGoalInput) {
  return postJson<FinancialGoalRecord, CreateFinancialGoalInput>('/api/finance/goals', input, {
    cache: 'no-store',
    credentials: 'include',
  });
}

export function updateFinancialGoal(id: string, input: UpdateFinancialGoalInput) {
  return patchJson<FinancialGoalRecord, UpdateFinancialGoalInput>(
    `/api/finance/goals/${id}`,
    input,
    {
      cache: 'no-store',
      credentials: 'include',
    },
  );
}

export function updateFinancialGoalProgress(id: string, input: UpdateFinancialGoalProgressInput) {
  return patchJson<FinancialGoalRecord, UpdateFinancialGoalProgressInput>(
    `/api/finance/goals/${id}/progress`,
    input,
    {
      cache: 'no-store',
      credentials: 'include',
    },
  );
}

export function completeFinancialGoal(id: string) {
  return postJson<FinancialGoalRecord, Record<string, never>>(
    `/api/finance/goals/${id}/complete`,
    {},
    {
      cache: 'no-store',
      credentials: 'include',
    },
  );
}

export function deleteFinancialGoal(id: string) {
  return deleteJson<{ ok: true }>(`/api/finance/goals/${id}`, {
    cache: 'no-store',
    credentials: 'include',
  });
}

export function deleteFinancialGoalActivity(goalId: string, activityId: string) {
  return deleteJson<{ ok: true }>(
    `/api/finance/goals/${encodeURIComponent(goalId)}/activities/${encodeURIComponent(activityId)}`,
    {
      cache: 'no-store',
      credentials: 'include',
    },
  );
}

export function deleteTransaction(id: string) {
  return deleteJson<{ ok: true }>(`/api/finance/transactions/${encodeURIComponent(id)}`, {
    cache: 'no-store',
    credentials: 'include',
  });
}

export function getNotifications(options?: {
  period?: 'daily' | 'weekly' | 'monthly';
  kind?: 'alert' | 'reminder' | 'insight' | 'update';
  unreadOnly?: boolean;
  limit?: number;
}) {
  const params = new URLSearchParams();
  if (options?.period) params.set('period', options.period);
  if (options?.kind) params.set('kind', options.kind);
  if (options?.unreadOnly) params.set('unreadOnly', 'true');
  if (typeof options?.limit === 'number') params.set('limit', String(options.limit));
  const query = params.toString();
  return getJson<NotificationsResponseRecord>(
    `/api/finance/notifications${query ? `?${query}` : ''}`,
    {
      cache: 'no-store',
      credentials: 'include',
    },
  );
}

export function generateNotifications() {
  return postJson<{ ok: true }, Record<string, never>>('/api/finance/notifications/generate', {}, {
    cache: 'no-store',
    credentials: 'include',
  });
}

export function markNotificationRead(id: string, read = true) {
  return patchJson<{ ok: true }, { read: boolean }>(
    `/api/finance/notifications/${id}/read`,
    { read },
    {
      cache: 'no-store',
      credentials: 'include',
    },
  );
}

export function markAllNotificationsRead() {
  return postJson<{ ok: true }, Record<string, never>>(
    '/api/finance/notifications/read-all',
    {},
    {
      cache: 'no-store',
      credentials: 'include',
    },
  );
}
