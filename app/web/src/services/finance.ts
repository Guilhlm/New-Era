import type {
  CreateInvestmentInput,
  DepositFundsInput,
  FinanceSummaryRecord,
  FxRateRecord,
  InvestmentRecord,
  MarketAssetRowRecord,
  MarketBoardRecord,
  MarketSearchRecord,
  MarketTradeInput,
  QuoteCurrency,
  RegisterPositionInput,
  TradeInvestmentInput,
  UpdateInvestmentInput,
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
