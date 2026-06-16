'use client';

import { useMemo } from 'react';
import { useWalletFxQuery } from '@/hooks/use-wallet-market-query';
import { useWalletPreferences } from '@/hooks/use-wallet-preferences';
import { useWalletSummaryQuery } from '@/hooks/use-wallet-summary-query';
import type { Period } from '@/types/profile';
import type { WalletPerformancePeriod } from '@/types/wallet';
import { convertUsdtToDisplay } from '@/utils/wallet';

function mapProfilePeriodToWalletQuery(period: Period): WalletPerformancePeriod {
  return period === 7 ? '1W' : '1M';
}

function slicePerformancePoints<T extends { label: string; value: number }>(
  points: T[],
  period: Period,
): T[] {
  if (period === 7) return points.slice(-7);
  if (period === 14) return points.slice(-14);
  return points.slice(-30);
}

export function useProfileFinancialChart(period: Period, enabled: boolean) {
  const { currency } = useWalletPreferences();
  const fxQuery = useWalletFxQuery();
  const walletPeriod = mapProfilePeriodToWalletQuery(period);
  const summaryQuery = useWalletSummaryQuery(walletPeriod);

  const fxRate = currency === 'BRL' ? (fxQuery.data?.rate ?? 1) : 1;

  const points = useMemo(() => {
    if (!enabled || !summaryQuery.data) return [];
    const converted = summaryQuery.data.performance.points.map((point) => ({
      label: point.label,
      value: convertUsdtToDisplay(point.value, { currency, fxRate }),
    }));
    return slicePerformancePoints(converted, period);
  }, [enabled, summaryQuery.data, period, currency, fxRate]);

  return {
    points,
    loading: enabled && summaryQuery.isPending,
    currency,
  };
}

export type ProfileFinancialChartState = ReturnType<typeof useProfileFinancialChart>;
