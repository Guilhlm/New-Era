import { InvestmentType } from '@prisma/client';
import type { FinanceTab } from '../investment/dto/investment.dto';

export type MarketAssetDef = {
  ticker: string;
  name: string;
  type: InvestmentType;
};

export const MARKET_WATCHLIST: Record<FinanceTab, MarketAssetDef[]> = {
  stocks: [
    { ticker: 'AAPL', name: 'Apple Inc.', type: InvestmentType.STOCK },
    { ticker: 'MSFT', name: 'Microsoft Corp.', type: InvestmentType.STOCK },
    { ticker: 'GOOG', name: 'Alphabet Inc.', type: InvestmentType.STOCK },
    { ticker: 'NVDA', name: 'NVIDIA Corp.', type: InvestmentType.STOCK },
    { ticker: 'TSLA', name: 'Tesla Inc.', type: InvestmentType.STOCK },
    { ticker: 'AMZN', name: 'Amazon.com Inc.', type: InvestmentType.STOCK },
    { ticker: 'META', name: 'Meta Platforms Inc.', type: InvestmentType.STOCK },
    { ticker: 'AMD', name: 'Advanced Micro Devices', type: InvestmentType.STOCK },
    { ticker: 'NFLX', name: 'Netflix Inc.', type: InvestmentType.STOCK },
    { ticker: 'JPM', name: 'JPMorgan Chase & Co.', type: InvestmentType.STOCK },
    { ticker: 'V', name: 'Visa Inc.', type: InvestmentType.STOCK },
    { ticker: 'MA', name: 'Mastercard Inc.', type: InvestmentType.STOCK },
    { ticker: 'JNJ', name: 'Johnson & Johnson', type: InvestmentType.STOCK },
    { ticker: 'WMT', name: 'Walmart Inc.', type: InvestmentType.STOCK },
    { ticker: 'DIS', name: 'Walt Disney Co.', type: InvestmentType.STOCK },
    { ticker: 'INTC', name: 'Intel Corp.', type: InvestmentType.STOCK },
    { ticker: 'CRM', name: 'Salesforce Inc.', type: InvestmentType.STOCK },
    { ticker: 'ORCL', name: 'Oracle Corp.', type: InvestmentType.STOCK },
    { ticker: 'KO', name: 'Coca-Cola Co.', type: InvestmentType.STOCK },
    { ticker: 'BAC', name: 'Bank of America Corp.', type: InvestmentType.STOCK },
    { ticker: 'XOM', name: 'Exxon Mobil Corp.', type: InvestmentType.STOCK },
    { ticker: 'COST', name: 'Costco Wholesale Corp.', type: InvestmentType.STOCK },
    { ticker: 'AVGO', name: 'Broadcom Inc.', type: InvestmentType.STOCK },
    { ticker: 'LLY', name: 'Eli Lilly and Co.', type: InvestmentType.STOCK },
    { ticker: 'UNH', name: 'UnitedHealth Group Inc.', type: InvestmentType.STOCK },
  ],
  crypto: [
    { ticker: 'BTC', name: 'Bitcoin', type: InvestmentType.CRYPTO },
    { ticker: 'ETH', name: 'Ethereum', type: InvestmentType.CRYPTO },
    { ticker: 'USDT', name: 'Tether', type: InvestmentType.CRYPTO },
    { ticker: 'SOL', name: 'Solana', type: InvestmentType.CRYPTO },
    { ticker: 'BNB', name: 'BNB', type: InvestmentType.CRYPTO },
    { ticker: 'XRP', name: 'XRP', type: InvestmentType.CRYPTO },
    { ticker: 'ADA', name: 'Cardano', type: InvestmentType.CRYPTO },
    { ticker: 'DOGE', name: 'Dogecoin', type: InvestmentType.CRYPTO },
    { ticker: 'DOT', name: 'Polkadot', type: InvestmentType.CRYPTO },
    { ticker: 'LINK', name: 'Chainlink', type: InvestmentType.CRYPTO },
    { ticker: 'LTC', name: 'Litecoin', type: InvestmentType.CRYPTO },
    { ticker: 'AVAX', name: 'Avalanche', type: InvestmentType.CRYPTO },
    { ticker: 'TRX', name: 'TRON', type: InvestmentType.CRYPTO },
    { ticker: 'MATIC', name: 'Polygon', type: InvestmentType.CRYPTO },
    { ticker: 'SHIB', name: 'Shiba Inu', type: InvestmentType.CRYPTO },
  ],
  etfs: [
    { ticker: 'SPY', name: 'SPDR S&P 500 ETF', type: InvestmentType.ETF },
    { ticker: 'QQQ', name: 'Invesco QQQ Trust', type: InvestmentType.ETF },
    { ticker: 'VOO', name: 'Vanguard S&P 500 ETF', type: InvestmentType.ETF },
    { ticker: 'IVV', name: 'iShares Core S&P 500', type: InvestmentType.ETF },
    { ticker: 'VTI', name: 'Vanguard Total Stock Market', type: InvestmentType.ETF },
    { ticker: 'IWM', name: 'iShares Russell 2000 ETF', type: InvestmentType.ETF },
    { ticker: 'EEM', name: 'iShares MSCI Emerging Markets ETF', type: InvestmentType.ETF },
    { ticker: 'ARKK', name: 'ARK Innovation ETF', type: InvestmentType.ETF },
    { ticker: 'SCHD', name: 'Schwab US Dividend Equity ETF', type: InvestmentType.ETF },
    { ticker: 'GLD', name: 'SPDR Gold Shares', type: InvestmentType.ETF },
    { ticker: 'SLV', name: 'iShares Silver Trust', type: InvestmentType.ETF },
    { ticker: 'VNQ', name: 'Vanguard Real Estate ETF', type: InvestmentType.ETF },
    { ticker: 'VEA', name: 'Vanguard FTSE Developed Markets ETF', type: InvestmentType.ETF },
    { ticker: 'BND', name: 'Vanguard Total Bond Market ETF', type: InvestmentType.ETF },
    { ticker: 'AGG', name: 'iShares Core US Aggregate Bond ETF', type: InvestmentType.ETF },
  ],
  mine: [],
};

export const CRYPTO_COINGECKO_IDS: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  USDT: 'tether',
  SOL: 'solana',
  BNB: 'binancecoin',
  XRP: 'ripple',
  ADA: 'cardano',
  DOGE: 'dogecoin',
  DOT: 'polkadot',
  LINK: 'chainlink',
  LTC: 'litecoin',
  AVAX: 'avalanche-2',
  TRX: 'tron',
  MATIC: 'matic-network',
  SHIB: 'shiba-inu',
};

export function findMarketAsset(ticker: string): MarketAssetDef | undefined {
  const normalized = ticker.trim().toUpperCase();
  for (const tab of Object.keys(MARKET_WATCHLIST) as FinanceTab[]) {
    const asset = MARKET_WATCHLIST[tab].find((item) => item.ticker === normalized);
    if (asset) return asset;
  }
  return undefined;
}

/** Paginated crypto board size exposed in the Market tab (CoinGecko pages × page size). */
export const CRYPTO_BOARD_TOTAL = 250;
export const CRYPTO_BOARD_PAGE_SIZE = 50;
