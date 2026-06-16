'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getFinanceSummary } from '@/services/finance';
import type { WalletPerformancePeriod } from '@/types/wallet';

export function useWalletSummaryQuery(period: WalletPerformancePeriod = '1W') {
  return useQuery({
    queryKey: queryKeys.walletSummary(period),
    queryFn: () => getFinanceSummary(period),
    staleTime: 30_000,
  });
}
