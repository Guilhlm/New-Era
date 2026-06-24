'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getMarketBoard, getFxRate } from '@/services/finance';
import type { QuoteCurrency } from '@/types/finance';
import type { WalletInvestmentTab } from '@/types/wallet';
import { mapMarketBoardToVm } from '@/utils/market-mapper';
import { useQuery } from '@tanstack/react-query';

export const MARKET_PAGE_SIZE = 20;
export const CRYPTO_MARKET_PAGE_SIZE = 50;
export const CRYPTO_BOARD_TOTAL = 250;

export function marketBoardPageSize(tab: WalletInvestmentTab) {
  return tab === 'crypto' ? CRYPTO_MARKET_PAGE_SIZE : MARKET_PAGE_SIZE;
}

export type WalletMarketBoardPage = {
  rows: ReturnType<typeof mapMarketBoardToVm>;
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
  fxRate: number;
  currency: QuoteCurrency;
  quotedAt: string;
  stale?: boolean;
};

export async function fetchWalletMarketBoard(
  tab: WalletInvestmentTab,
  currency: QuoteCurrency,
  offset = 0,
  limit = MARKET_PAGE_SIZE,
): Promise<WalletMarketBoardPage> {
  const board = await getMarketBoard(tab, currency, offset, limit);
  return {
    rows: mapMarketBoardToVm(board.rows),
    total: board.total,
    offset: board.offset,
    limit: board.limit,
    hasMore: board.hasMore,
    fxRate: board.fxRate,
    currency: board.currency,
    quotedAt: board.quotedAt,
    stale: board.stale,
  };
}

export function useWalletMarketQuery(tab: WalletInvestmentTab, currency: QuoteCurrency) {
  const pageSize = marketBoardPageSize(tab);

  return useInfiniteQuery({
    queryKey: [...queryKeys.walletMarket(tab, currency), pageSize],
    queryFn: ({ pageParam }) =>
      fetchWalletMarketBoard(tab, currency, pageParam, pageSize),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.offset + lastPage.limit : undefined,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  });
}

export function useWalletFxQuery() {
  return useQuery({
    queryKey: queryKeys.walletFx,
    queryFn: () => getFxRate(),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  });
}
