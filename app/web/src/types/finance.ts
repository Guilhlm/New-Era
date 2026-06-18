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
    currency?: QuoteCurrency;
    alreadyConverted?: boolean;
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
  source?: 'CARD' | 'CASH' | 'MONTHLY_SALARY' | 'EXTRA_INCOME';
  cardId?: string;
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

export type MonthlyExpenseRecord = {
  id: string;
  date: string;
  title: string;
  categoryId: string | null;
  categoryName: string;
  amount: number;
  account: string;
  status: 'paid' | 'pending';
  fixed: boolean;
  source: string;
  linkedTransactionId: string | null;
  editable: boolean;
  deletable?: boolean;
};

export type MonthlyExpenseCategoryRecord = {
  id: string;
  name: string;
  budget: number;
  spent: number;
  isSystem: boolean;
  isLocked: boolean;
  systemKey: string | null;
};

export type MonthlyExpenseCardRecord = {
  id: string;
  holderName: string;
  lastFour: string;
  brand: string;
  color: string;
  limitTotal: number;
  limitUsage: number;
  type: 'CREDIT' | 'DEBIT';
};

export type MonthlyExpensesSummaryRecord = {
  month: string;
  summary: {
    spent: number;
    budget: number;
    remaining: number;
    vsLastMonth: number;
    income: number;
    cardLimit: number;
    fixedCommitments: number;
  };
  categories: MonthlyExpenseCategoryRecord[];
  cards: MonthlyExpenseCardRecord[];
  expenses: MonthlyExpenseRecord[];
};

export type CreateMonthlyExpenseInput = {
  title: string;
  amount: number;
  categoryId?: string;
  account?: string;
  date?: string;
  status?: 'paid' | 'pending';
};

export type UpdateMonthlyExpenseInput = Partial<CreateMonthlyExpenseInput>;

export type CreateMonthlyExpenseCategoryInput = {
  name: string;
  budget?: number;
  spentAdjustment?: number;
};

export type UpdateMonthlyExpenseCategoryInput = Partial<CreateMonthlyExpenseCategoryInput>;

export type CreateMonthlyExpenseCardInput = {
  holderName: string;
  lastFour: string;
  brand?: string;
  color?: string;
  limitTotal: number;
  limitUsage?: number;
  type?: 'CREDIT' | 'DEBIT';
};

export type UpdateMonthlyExpenseCardInput = Partial<CreateMonthlyExpenseCardInput>;

export type FinancialGoalRecord = {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
  isSystem: boolean;
  isLocked: boolean;
  systemKey: string | null;
  activities: Array<{
    id: string;
    label: string;
    amount: number;
    date: string;
    source?: string | null;
    canDelete?: boolean;
  }>;
};

export type FinancialGoalsListRecord = {
  goals: FinancialGoalRecord[];
  trends: {
    saved: number;
    progress: number;
  };
};

export type CreateFinancialGoalInput = {
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount?: number;
  deadline?: string;
};

export type UpdateFinancialGoalInput = Partial<CreateFinancialGoalInput>;

export type UpdateFinancialGoalProgressInput = {
  amount: number;
  mode?: 'set' | 'add';
  label?: string;
};

export type NotificationRecord = {
  id: string;
  category: 'tasks' | 'finance' | 'goals' | 'wallet' | 'diet' | 'training' | 'body' | 'system';
  kind: 'alert' | 'reminder' | 'insight' | 'update';
  priority: 'urgent' | 'normal' | 'low';
  period: 'daily' | 'weekly' | 'monthly';
  title: string;
  body: string;
  read: boolean;
  href?: string | null;
  ctaLabel?: string | null;
  createdAt: string;
};

export type NotificationsResponseRecord = {
  unreadCount: number;
  items: NotificationRecord[];
};
