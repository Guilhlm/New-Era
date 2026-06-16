export type WalletCurrency = 'USDT' | 'BRL';

export type WalletStatFooterMetric = {
  kind: 'metric';
  value: string;
  label: string;
  tone?: 'positive' | 'negative' | 'neutral';
};

export type WalletStatFooterAction = {
  kind: 'action';
  label: string;
};

export type WalletStatCardVm = {
  id: string;
  title: string;
  amount: number;
  amountTone?: 'positive' | 'negative' | 'neutral';
  showEye?: boolean;
  footerLeft: WalletStatFooterMetric;
  footerRight: WalletStatFooterMetric | WalletStatFooterAction;
};

export type WalletAllocationSegmentVm = {
  key: string;
  label: string;
  value: number;
  pct: number;
  color: string;
};

export type WalletPerformancePointVm = {
  label: string;
  value: number;
};

export type WalletPerformancePeriod = '1D' | '1W' | '1M' | '5M' | '1Y';

export type WalletInvestmentTab = 'stocks' | 'crypto' | 'etfs' | 'mine';

export type WalletInvestmentLastAction = 'buy' | 'sell';

export type WalletInvestmentRowVm = {
  id: string | null;
  ticker: string;
  name: string;
  type: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  priceUsdt: number;
  value: number;
  gainPct: number;
  gainAmount: number;
  changePct24h: number;
  hasPosition: boolean;
  lastAction: WalletInvestmentLastAction | null;
};

export type WalletTransactionVm = {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
};

export type WalletPortfolioInsightVm = {
  positionsCount: number;
  winnersCount: number;
  losersCount: number;
  best: {
    ticker: string;
    gainPct: number;
  };
  worst: {
    ticker: string;
    gainPct: number;
  };
};
