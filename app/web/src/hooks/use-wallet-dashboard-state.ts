'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import type { WalletCashMode } from '@/components/wallet/wallet-cash-dialog';
import { useIsClientMounted } from '@/hooks/use-is-client-mounted';
import {
  useWalletMarketQuery,
  useWalletFxQuery,
} from '@/hooks/use-wallet-market-query';
import { queryKeys } from '@/lib/query-keys';
import { useWalletMutations } from '@/hooks/use-wallet-mutations';
import { useWalletPreferences } from '@/hooks/use-wallet-preferences';
import { useWalletSummaryQuery } from '@/hooks/use-wallet-summary-query';
import type { MarketSearchResultRecord, QuoteCurrency } from '@/types/finance';
import type { WalletInvestmentRowVm } from '@/types/wallet';
import type {
  WalletInvestmentTab,
  WalletPerformancePeriod,
  WalletCurrency,
} from '@/types/wallet';
import {
  buildEmptyWalletStats,
  buildWalletStatsFromSummary,
  buildAllocationDisplayFromSummary,
  mapTransactionsToVm,
} from '@/utils/finance-mapper';
import { mapMarketRowToVm } from '@/utils/market-mapper';
import { clampFinanceUsdt, convertUsdtToDisplay } from '@/utils/wallet';
import { getMarketAssetRow, getMonthlyExpenseCards, getMonthlyExpenses } from '@/services/finance';
import { HttpError } from '@/services/http';

const INVESTMENT_TABS: { id: WalletInvestmentTab; label: string }[] = [
  { id: 'stocks', label: 'Stocks' },
  { id: 'crypto', label: 'Crypto' },
  { id: 'etfs', label: 'ETFs' },
  { id: 'mine', label: 'My assets' },
];

const PERFORMANCE_PERIODS: WalletPerformancePeriod[] = ['1D', '1W', '1M', '5M', '1Y'];

function currentMonthKey() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function useWalletDashboardState() {
  const { currency, investmentTab, setCurrency, setInvestmentTab } = useWalletPreferences();
  const [performancePeriod, setPerformancePeriod] = useState<WalletPerformancePeriod>('1W');
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [cashDialogOpen, setCashDialogOpen] = useState(false);
  const [cashDialogMode, setCashDialogMode] = useState<WalletCashMode>('deposit');
  const [positionDialogOpen, setPositionDialogOpen] = useState(false);
  const [positionPresetRow, setPositionPresetRow] = useState<WalletInvestmentRowVm | null>(null);
  const [editInvestment, setEditInvestment] = useState<WalletInvestmentRowVm | null>(null);
  const [tradeRow, setTradeRow] = useState<WalletInvestmentRowVm | null>(null);
  const [tradeAction, setTradeAction] = useState<'BUY' | 'SELL'>('BUY');
  const [saving, setSaving] = useState(false);
  const [pinnedMarketRow, setPinnedMarketRow] = useState<WalletInvestmentRowVm | null>(null);
  const [highlightedTicker, setHighlightedTicker] = useState<string | null>(null);
  const monthlyExpenseMonth = useMemo(() => currentMonthKey(), []);

  const summaryQuery = useWalletSummaryQuery(performancePeriod);
  const marketQuery = useWalletMarketQuery(investmentTab, currency as QuoteCurrency);
  const fxQuery = useWalletFxQuery();
  const monthlyExpensesQuery = useQuery({
    queryKey: queryKeys.monthlyExpenses(monthlyExpenseMonth),
    queryFn: () => getMonthlyExpenses(monthlyExpenseMonth),
    staleTime: 20_000,
  });
  const cardsQuery = useQuery({
    queryKey: queryKeys.monthlyExpenseCards,
    queryFn: getMonthlyExpenseCards,
    staleTime: 30_000,
  });
  const mutations = useWalletMutations({ investmentTab, performancePeriod, currency });
  const mounted = useIsClientMounted();

  useEffect(() => {
    setPinnedMarketRow(null);
    setHighlightedTicker(null);
  }, [investmentTab, currency]);

  const summary = summaryQuery.data;
  const firstMarketPage = marketQuery.data?.pages.find((page) => page.currency === currency);
  const marketRows = useMemo(() => {
    const pages = marketQuery.data?.pages ?? [];
    const seen = new Set<string>();
    const merged: WalletInvestmentRowVm[] = [];

    for (const page of pages) {
      if (page.currency !== currency) continue;
      for (const row of page.rows) {
        const key = row.ticker.toUpperCase();
        if (seen.has(key)) continue;
        seen.add(key);
        merged.push(row);
      }
    }

    if (pinnedMarketRow) {
      const key = pinnedMarketRow.ticker.toUpperCase();
      if (!seen.has(key)) {
        return [pinnedMarketRow, ...merged];
      }
    }

    return merged;
  }, [marketQuery.data, currency, pinnedMarketRow]);

  const marketTotal = firstMarketPage?.total ?? marketRows.length;
  const brlFxRate =
    fxQuery.data?.rate ??
    (firstMarketPage?.currency === 'BRL' ? firstMarketPage.fxRate : undefined) ??
    1;
  const fxRate = currency === 'BRL' ? brlFxRate : 1;
  const isSummaryLoading = mounted && summaryQuery.isPending && !summaryQuery.data;
  const isMarketLoading =
    mounted &&
    marketRows.length === 0 &&
    !marketQuery.isError &&
    (marketQuery.isPending || marketQuery.isFetching);
  const isLoading = isSummaryLoading || isMarketLoading;
  const isMarketFetching = mounted && marketQuery.isFetching && marketRows.length > 0;
  const hasMoreMarketRows = Boolean(marketQuery.hasNextPage);
  const isLoadingMoreMarketRows = marketQuery.isFetchingNextPage;

  const displayOptions = useMemo(
    () => ({ currency: currency as WalletCurrency, fxRate }),
    [currency, fxRate],
  );

  const data = useMemo(
    () => ({
      stats: summary
        ? buildWalletStatsFromSummary(summary, displayOptions)
        : buildEmptyWalletStats(displayOptions),
      portfolioInsight: summary?.portfolioInsight ?? {
        positionsCount: 0,
        winnersCount: 0,
        losersCount: 0,
        best: { ticker: '-', gainPct: 0 },
        worst: { ticker: '-', gainPct: 0 },
      },
      allocation: summary
        ? (() => {
            const allocationDisplay = buildAllocationDisplayFromSummary(summary, displayOptions);
            return {
              centerPct: allocationDisplay.centerPct,
              centerCaption: currency,
              segments: allocationDisplay.segments,
              performance: {
                ...summary.performance,
                gainAmount: convertUsdtToDisplay(summary.performance.gainAmount, displayOptions),
                points: summary.performance.points.map((point) => ({
                  ...point,
                  value: convertUsdtToDisplay(point.value, displayOptions),
                })),
              },
            };
          })()
        : {
            centerPct: 0,
            centerCaption: currency,
            segments: [],
            performance: { gainAmount: 0, gainPct: 0, points: [] },
          },
      investments: marketRows,
      transactions: summary ? mapTransactionsToVm(summary.recentTransactions) : [],
      investmentTabs: INVESTMENT_TABS,
      performancePeriods: PERFORMANCE_PERIODS,
      primaryWalletId: summary?.primaryWalletId ?? null,
      walletCashAvailable: summary?.walletCashAvailable ?? 0,
      monthlySalaryRemaining: monthlyExpensesQuery.data?.summary.remaining ?? null,
      cards: (cardsQuery.data ?? []).map((card) => ({
        id: card.id,
        label: `${card.brand === 'mastercard' ? 'Mastercard' : 'Visa'} •••• ${card.lastFour}`,
        limit: card.limitTotal,
        used: card.limitUsage,
      })),
      marketQuotedAt: firstMarketPage?.quotedAt ?? null,
      marketTotal,
      fxRate,
      brlFxRate,
    }),
    [summary, firstMarketPage, marketRows, marketTotal, currency, fxRate, displayOptions, brlFxRate, monthlyExpensesQuery.data, cardsQuery.data],
  );

  return {
    data,
    actions: {
      setCurrency,
      setPerformancePeriod,
      setInvestmentTab,
      toggleBalanceHidden: () => setBalanceHidden((prev) => !prev),
      openDeposit: () => {
        setCashDialogMode('deposit');
        setCashDialogOpen(true);
      },
      openWithdraw: () => {
        setCashDialogMode('withdraw');
        setCashDialogOpen(true);
      },
      closeCashDialog: () => setCashDialogOpen(false),
      openRegisterPosition: (row?: WalletInvestmentRowVm | null) => {
        setPositionPresetRow(row ?? null);
        setPositionDialogOpen(true);
      },
      closeRegisterPosition: () => {
        setPositionDialogOpen(false);
        setPositionPresetRow(null);
      },
      registerPosition: async (input: Parameters<typeof mutations.registerPosition>[0]) => {
        setSaving(true);
        try {
          await mutations.registerPosition(input);
          setPositionDialogOpen(false);
          setPositionPresetRow(null);
        } finally {
          setSaving(false);
        }
      },
      openEditPosition: (row: WalletInvestmentRowVm) => {
        if (!row.id) return;
        setEditInvestment(row);
      },
      closeEditPosition: () => setEditInvestment(null),
      deletePosition: async (id: string) => {
        setSaving(true);
        try {
          await mutations.deleteInvestment(id);
          setEditInvestment(null);
        } finally {
          setSaving(false);
        }
      },
      openTrade: async (row: WalletInvestmentRowVm, action: 'BUY' | 'SELL') => {
        setTradeAction(action);
        if (row.priceUsdt <= 0) {
          try {
            const { row: refreshed } = await getMarketAssetRow(
              investmentTab,
              row.ticker,
              currency as QuoteCurrency,
            );
            if (refreshed && refreshed.priceUsdt > 0) {
              setTradeRow(mapMarketRowToVm(refreshed));
              return;
            }
          } catch {
            // keep original row; dialog will keep waiting for quote
          }
        }
        setTradeRow(row);
      },
      closeTrade: () => setTradeRow(null),
      tradeMarket: async (shares: number, priceUsdt: number, budgetUsdt?: number) => {
        if (!tradeRow) return;
        setSaving(true);
        try {
          const availableUsdt = summary?.walletCashAvailable ?? 0;
          const normalizedBudget =
            budgetUsdt != null
              ? clampFinanceUsdt(Math.min(budgetUsdt, availableUsdt))
              : undefined;

          await mutations.tradeMarket({
            ticker: tradeRow.ticker,
            name: tradeRow.name,
            type: tradeRow.type as Parameters<typeof mutations.tradeMarket>[0]['type'],
            action: tradeAction,
            shares,
            price: priceUsdt,
            budgetUsdt: normalizedBudget && normalizedBudget > 0 ? normalizedBudget : undefined,
          });
          setTradeRow(null);
        } finally {
          setSaving(false);
        }
      },
      submitCash: async (input: {
        amount: number;
        currency: QuoteCurrency;
        mode: WalletCashMode;
      }) => {
        setSaving(true);
        try {
          const basePayload = {
            amount: input.amount,
            currency: 'BRL' as const,
            walletId: summary?.primaryWalletId ?? undefined,
          };
          if (input.mode === 'withdraw') {
            await mutations.withdrawFunds(basePayload);
          } else {
            await mutations.depositFunds({
              ...basePayload,
              source: 'MONTHLY_SALARY',
            });
          }
          setCashDialogOpen(false);
        } finally {
          setSaving(false);
        }
      },
      loadMoreMarketRows: () => {
        if (!marketQuery.hasNextPage || marketQuery.isFetchingNextPage) return;
        void marketQuery.fetchNextPage();
      },
      selectMarketSearchResult: async (result: MarketSearchResultRecord) => {
        setHighlightedTicker(result.ticker.toUpperCase());

        const existing = marketRows.find(
          (row) => row.ticker.toUpperCase() === result.ticker.toUpperCase(),
        );
        if (existing) return;

        try {
          const { row } = await getMarketAssetRow(
            investmentTab,
            result.ticker,
            currency as QuoteCurrency,
            {
              coinId: result.coinId,
              name: result.name,
            },
          );
          if (row) {
            setPinnedMarketRow(mapMarketRowToVm(row));
          }
        } catch {
          setPinnedMarketRow({
            id: null,
            ticker: result.ticker.toUpperCase(),
            name: result.name,
            type: result.type,
            shares: 0,
            avgPrice: 0,
            currentPrice: 0,
            priceUsdt: 0,
            value: 0,
            gainPct: 0,
            gainAmount: 0,
            changePct24h: 0,
            hasPosition: false,
            lastAction: null,
          });
        }
      },
    },
    ui: {
      currency,
      performancePeriod,
      investmentTab,
      balanceHidden,
      loading: isLoading,
      marketLoading: isMarketLoading,
      marketFetching: isMarketFetching,
      marketHasMore: hasMoreMarketRows,
      marketLoadingMore: isLoadingMoreMarketRows,
      highlightedTicker,
      saving,
      cashDialogOpen,
      cashDialogMode,
      positionDialogOpen,
      positionPresetRow,
      editInvestment,
      tradeRow,
      tradeAction,
      error:
        summaryQuery.error instanceof HttpError
          ? summaryQuery.error.message
          : marketQuery.error instanceof HttpError
            ? marketQuery.error.message
            : summaryQuery.error || marketQuery.error
              ? 'Failed to load wallet data.'
              : null,
    },
  };
}

export type WalletDashboardState = ReturnType<typeof useWalletDashboardState>;
