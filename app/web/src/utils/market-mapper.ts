import type { MarketBoardRowRecord } from '@/types/finance';
import type { WalletInvestmentRowVm } from '@/types/wallet';

export function mapMarketRowToVm(row: MarketBoardRowRecord): WalletInvestmentRowVm {
  return {
    id: row.id,
    ticker: row.ticker,
    name: row.name,
    type: row.type,
    shares: row.shares,
    avgPrice: row.avgPrice,
    currentPrice: row.currentPrice,
    priceUsdt: row.priceUsdt,
    value: row.value,
    gainPct: row.gainPct,
    gainAmount: row.gainAmount,
    changePct24h: row.changePct24h,
    hasPosition: row.hasPosition,
    lastAction: row.lastAction === 'SELL' ? 'sell' : row.lastAction === 'BUY' ? 'buy' : null,
  };
}

export function mapMarketBoardToVm(rows: MarketBoardRowRecord[]): WalletInvestmentRowVm[] {
  return rows.map(mapMarketRowToVm);
}
