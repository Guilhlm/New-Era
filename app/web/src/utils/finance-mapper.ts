import type {
  FinanceSummaryRecord,
  InvestmentLastActionRecord,
  InvestmentRecord,
} from '@/types/finance';
import type {
  WalletCurrency,
  WalletInvestmentRowVm,
  WalletStatCardVm,
  WalletTransactionVm,
} from '@/types/wallet';
import { formatWalletAmount, formatWalletPercent, convertUsdtToDisplay } from '@/utils/wallet';
import { applyAllocationColors, colorizeAllocationSegments } from '@/utils/wallet-allocation-colors';
import type { WalletAllocationSegmentVm } from '@/types/wallet';

type DisplayOptions = { currency?: WalletCurrency; fxRate?: number };

function num(value: number | string | null | undefined): number {
  if (value == null) return 0;
  return typeof value === 'number' ? value : Number(value);
}

function mapLastAction(action: InvestmentLastActionRecord): WalletInvestmentRowVm['lastAction'] {
  return action === 'SELL' ? 'sell' : 'buy';
}

export function mapInvestmentToVm(record: InvestmentRecord): WalletInvestmentRowVm {
  const shares = num(record.shares);
  const avgPrice = num(record.avgPrice);
  const currentPrice = num(record.currentPrice);
  const value = num(record.currentValue);
  const costValue = num(record.costValue);
  const gainAmount = value - costValue;
  const gainPct = costValue > 0 ? (gainAmount / costValue) * 100 : 0;

  return {
    id: record.id,
    ticker: record.ticker || record.name.slice(0, 12).toUpperCase(),
    name: record.name,
    type: record.type,
    shares,
    avgPrice,
    currentPrice,
    priceUsdt: currentPrice,
    value,
    gainPct,
    gainAmount,
    changePct24h: 0,
    hasPosition: shares > 0,
    lastAction: mapLastAction(record.lastAction),
  };
}

export function mapInvestmentsToVm(records: InvestmentRecord[]): WalletInvestmentRowVm[] {
  return records.map(mapInvestmentToVm);
}

export function mapTransactionsToVm(
  records: FinanceSummaryRecord['recentTransactions'],
): WalletTransactionVm[] {
  return records.map((record) => ({
    id: record.id,
    title: record.title,
    subtitle: record.subtitle,
    amount: record.amount,
    currency: record.currency,
    alreadyConverted: record.alreadyConverted,
  }));
}

export function buildEmptyWalletStats(options?: DisplayOptions): WalletStatCardVm[] {
  const fmt = (value: number, signed?: boolean) =>
    formatWalletAmount(value, { signed, currency: options?.currency, fxRate: options?.fxRate });
  return [
    {
      id: 'total-balance',
      title: 'Total Balance',
      amount: 0,
      footerLeft: {
        kind: 'metric',
        value: fmt(0, true),
        label: 'Today',
        tone: 'neutral',
      },
      footerRight: {
        kind: 'metric',
        value: formatWalletPercent(0, { signed: true }),
        label: 'All Time',
        tone: 'neutral',
      },
    },
    {
      id: 'invested-amount',
      title: 'Invested Amount',
      amount: 0,
      footerLeft: {
        kind: 'metric',
        value: '0.0%',
        label: 'of Total Balance',
        tone: 'neutral',
      },
      footerRight: {
        kind: 'metric',
        value: fmt(0, true),
        label: 'Total Gain',
        tone: 'neutral',
      },
    },
    {
      id: 'available-to-invest',
      title: 'Available to Invest',
      amount: 0,
      showEye: true,
      footerLeft: {
        kind: 'metric',
        value: '0.0%',
        label: 'of Total Balance',
        tone: 'neutral',
      },
      footerRight: {
        kind: 'action',
        label: 'Deposit Funds',
      },
    },
  ];
}

export function buildWalletStatsFromSummary(
  summary: FinanceSummaryRecord,
  options?: DisplayOptions,
): WalletStatCardVm[] {
  const fmt = (value: number, signed?: boolean) =>
    formatWalletAmount(value, { signed, currency: options?.currency, fxRate: options?.fxRate });
  const todayTone = summary.todayGainAmount >= 0 ? 'positive' : 'negative';
  const allTimeTone = summary.allTimeGainAmount >= 0 ? 'positive' : 'negative';
  const totalGainTone = summary.allTimeGainAmount >= 0 ? 'positive' : 'negative';

  return [
    {
      id: 'total-balance',
      title: 'Total Balance',
      amount: summary.totalBalance,
      footerLeft: {
        kind: 'metric',
        value: fmt(summary.todayGainAmount, true),
        label: 'Today',
        tone: todayTone,
      },
      footerRight: {
        kind: 'metric',
        value: formatWalletPercent(summary.allTimeGainPct, { signed: true }),
        label: 'All Time',
        tone: allTimeTone,
      },
    },
    {
      id: 'invested-amount',
      title: 'Invested Amount',
      amount: summary.investedTotal,
      footerLeft: {
        kind: 'metric',
        value: `${summary.investedPctOfTotal.toFixed(1)}%`,
        label: 'of Total Balance',
        tone: 'neutral',
      },
      footerRight: {
        kind: 'metric',
        value: fmt(summary.allTimeGainAmount, true),
        label: 'Total Gain',
        tone: totalGainTone,
      },
    },
    {
      id: 'available-to-invest',
      title: 'Available to Invest',
      amount: summary.walletCashAvailable,
      showEye: true,
      footerLeft: {
        kind: 'metric',
        value: `${summary.availablePctOfTotal.toFixed(1)}%`,
        label: 'of Total Balance',
        tone: 'neutral',
      },
      footerRight: {
        kind: 'action',
        label: 'Deposit Funds',
      },
    },
  ];
}

export function buildAllocationDisplayFromSummary(
  summary: FinanceSummaryRecord,
  options?: DisplayOptions,
): { centerPct: number; segments: WalletAllocationSegmentVm[] } {
  const totalBalance = num(summary.totalBalance);
  if (totalBalance <= 0) {
    return { centerPct: 0, segments: [] };
  }

  const walletValueUsdt = num(summary.walletCashAvailable);

  const assetEntries = summary.allocation.segments
    .filter(
      (segment) =>
        segment.key !== 'wallet' &&
        segment.key !== 'others' &&
        num(segment.value) > 0,
    )
    .map((segment) => ({
      key: segment.key,
      label: segment.label,
      valueUsdt: num(segment.value),
    }))
    .sort((a, b) => b.valueUsdt - a.valueUsdt);

  const legacyOthersValue = summary.allocation.segments
    .filter((segment) => segment.key === 'others')
    .reduce((sum, segment) => sum + num(segment.value), 0);

  const top3 = assetEntries.slice(0, 3);
  const restAssetsValue =
    assetEntries.slice(3).reduce((sum, item) => sum + item.valueUsdt, 0) + legacyOthersValue;
  const restValue = restAssetsValue + (walletValueUsdt > 0 ? walletValueUsdt : 0);

  const bucketed: Array<{ key: string; label: string; valueUsdt: number }> = [...top3];
  if (restValue > 0) {
    bucketed.push({ key: 'others', label: 'Others', valueUsdt: restValue });
  }

  const segments = colorizeAllocationSegments(
    bucketed.slice(0, 4).map((segment) => ({
      key: segment.key,
      label: segment.label,
      value: convertUsdtToDisplay(segment.valueUsdt, options),
      pct: (segment.valueUsdt / totalBalance) * 100,
      color: '',
    })),
  );

  return {
    centerPct: segments[0]?.pct ?? summary.allocation.centerPct ?? 0,
    segments,
  };
}

export function mapProfileWalletSegments(summary: FinanceSummaryRecord, options?: DisplayOptions) {
  return buildAllocationDisplayFromSummary(summary, options).segments.map((segment) => ({
    key: segment.key,
    label: segment.label,
    pct: segment.pct,
    color: segment.color,
  }));
}

export function mapAllocationSegmentsForDisplay(
  segments: FinanceSummaryRecord['allocation']['segments'],
  options?: DisplayOptions,
) {
  return applyAllocationColors(segments).map((segment) => ({
    ...segment,
    value: convertUsdtToDisplay(segment.value, options),
  }));
}

export function buildFinanceDashboardVm(
  summary: FinanceSummaryRecord,
  investments: WalletInvestmentRowVm[],
  options?: DisplayOptions,
) {
  return {
    stats: buildWalletStatsFromSummary(summary, options),
    allocation: buildAllocationDisplayFromSummary(summary, options),
    transactions: mapTransactionsToVm(summary.recentTransactions),
    investments,
    portfolioInsight: summary.portfolioInsight,
    performance: summary.performance,
  };
}
