import type { WalletInvestmentRowVm } from '@/types/wallet';

export const SHARES_EPSILON = 1e-8;
export const MIN_TRADE_SHARES = 0.000001;

export function roundShares(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000;
}

export function isFractionalAsset(type: string): boolean {
  return type === 'CRYPTO';
}

export function getDefaultTradeQuantity(
  row: WalletInvestmentRowVm,
  action: 'BUY' | 'SELL',
): string {
  if (action === 'SELL' && row.hasPosition && row.shares > 0) {
    return isFractionalAsset(row.type) ? formatPositionShares(row.shares, row.type) : String(row.shares);
  }
  return isFractionalAsset(row.type) ? '0,001' : '1';
}

export function formatPositionShares(shares: number, type?: string): string {
  if (shares <= 0) return '—';
  const maxDecimals = type === 'CRYPTO' ? 8 : 4;
  return shares.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  });
}

export function sharesExceedPosition(requested: number, available: number): boolean {
  return requested - available > SHARES_EPSILON;
}
