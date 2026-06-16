export type InvestmentTypeRecord =
  | 'STOCK'
  | 'REIT'
  | 'CRYPTO'
  | 'FIXED_INCOME'
  | 'ETF'
  | 'OTHER';

export type InvestmentLastActionRecord = 'BUY' | 'SELL';

export type InvestmentRecord = {
  id: string;
  ticker: string;
  name: string;
  type: InvestmentTypeRecord;
  shares: number | string;
  avgPrice: number | string;
  currentPrice: number | string;
  currentValue: number | string;
  costValue: number | string | null;
  lastAction: InvestmentLastActionRecord;
  notes?: string | null;
};

export type FinanceSummaryRecord = {
  totalBalance: number;
  walletCashAvailable: number;
  investedTotal: number;
  walletTotal: number;
  todayGainAmount: number;
  todayGainPct: number;
  allTimeGainAmount: number;
  allTimeGainPct: number;
  investedPctOfTotal: number;
  availablePctOfTotal: number;
  primaryWalletId: string | null;
  allocation: {
    centerPct: number;
    centerCaption: string;
    segments: Array<{
      key: string;
      label: string;
      value: number;
      pct: number;
      color: string;
    }>;
  };
  portfolioInsight: {
    positionsCount: number;
    winnersCount: number;
    losersCount: number;
    best: { ticker: string; gainPct: number };
    worst: { ticker: string; gainPct: number };
  };
  recentTransactions: Array<{
    id: string;
    title: string;
    subtitle: string;
    amount: number;
  }>;
  performance: {
    period: string;
    gainAmount: number;
    gainPct: number;
    points: Array<{ label: string; value: number }>;
  };
};

export type CreateInvestmentInput = {
  ticker: string;
  name: string;
  type: InvestmentTypeRecord;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  lastAction?: InvestmentLastActionRecord;
  notes?: string;
};

export type RegisterPositionInput = {
  ticker: string;
  shares: number;
  costTotal?: number;
  avgPrice?: number;
  costCurrency?: QuoteCurrency;
  name?: string;
  type?: InvestmentTypeRecord;
  notes?: string;
};

export type UpdateInvestmentInput = Partial<CreateInvestmentInput>;

export type TradeInvestmentInput = {
  action: InvestmentLastActionRecord;
  shares: number;
  price: number;
};

export type DepositFundsInput = {
  amount: number;
  currency?: QuoteCurrency;
  walletId?: string;
  description?: string;
};

export type WithdrawFundsInput = DepositFundsInput;

export type WalletRecord = {
  id: string;
  name: string;
  type: 'CASH' | 'BANK' | 'CRYPTO';
  balance: number | string;
};

export type QuoteCurrency = 'USDT' | 'BRL';

export type MarketBoardRowRecord = {
  id: string | null;
  ticker: string;
  name: string;
  type: InvestmentTypeRecord;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  priceUsdt: number;
  value: number;
  gainPct: number;
  gainAmount: number;
  changePct24h: number;
  hasPosition: boolean;
  lastAction: InvestmentLastActionRecord | null;
};

export type MarketBoardRecord = {
  rows: MarketBoardRowRecord[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
  fxRate: number;
  currency: QuoteCurrency;
  quotedAt: string;
};

export type MarketSearchResultRecord = {
  ticker: string;
  name: string;
  type: InvestmentTypeRecord;
  /** CoinGecko id — disambiguates duplicate crypto symbols in search. */
  coinId?: string;
};

export type MarketSearchRecord = {
  results: MarketSearchResultRecord[];
};

export type MarketAssetRowRecord = {
  row: MarketBoardRowRecord | null;
};

export type FxRateRecord = {
  base: 'USDT';
  quote: 'BRL';
  rate: number;
  updatedAt: string;
};

export type MarketTradeInput = {
  ticker: string;
  name: string;
  type: InvestmentTypeRecord;
  action: InvestmentLastActionRecord;
  shares: number;
  price: number;
  budgetUsdt?: number;
};
