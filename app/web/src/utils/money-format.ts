import type { WalletCurrency } from '@/types/wallet';

export const MONEY_LOCALE = 'en-US';

export type MoneyFormatOptions = {
  currency?: WalletCurrency;
  fxRate?: number;
  signed?: boolean;
  alreadyConverted?: boolean;
};

function displayAmount(amountUsdt: number, options?: MoneyFormatOptions): number {
  const currency = options?.currency ?? 'USDT';
  const fxRate = options?.fxRate ?? 1;
  if (options?.alreadyConverted) return amountUsdt;
  return currency === 'BRL' ? amountUsdt * fxRate : amountUsdt;
}

export function roundDisplayAmount(value: number): number {
  return Math.round(value * 100) / 100;
}

function adaptivePriceFractionDigits(absValue: number): number {
  if (!Number.isFinite(absValue) || absValue === 0) return 2;
  if (absValue >= 0.01) return 2;
  return Math.min(8, Math.max(2, Math.ceil(-Math.log10(absValue)) + 4));
}

/** Live asset quotes — 2 decimals by default, up to 8 when the price is below 0.01. */
export function formatAssetPrice(amountUsdt: number, options?: MoneyFormatOptions): string {
  const display = displayAmount(amountUsdt, options);
  const currency = options?.currency ?? 'USDT';
  const prefix = options?.signed && display > 0 ? '+' : '';
  const fractionDigits = adaptivePriceFractionDigits(Math.abs(display));
  const formatted = display.toLocaleString(MONEY_LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: fractionDigits,
  });
  return currency === 'BRL' ? `${prefix}R$ ${formatted}` : `${prefix}$ ${formatted}`;
}

export function formatMoney(amountUsdt: number, options?: MoneyFormatOptions): string {
  const display = roundDisplayAmount(displayAmount(amountUsdt, options));
  const currency = options?.currency ?? 'USDT';
  const prefix = options?.signed && display > 0 ? '+' : '';
  const formatted = display.toLocaleString(MONEY_LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency === 'BRL' ? `${prefix}R$ ${formatted}` : `${prefix}$ ${formatted}`;
}

export function formatMoneyDraft(value: number): string {
  return roundDisplayAmount(value).toLocaleString(MONEY_LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatPercent(value: number, options?: { signed?: boolean }): string {
  const prefix = options?.signed && value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(2)}%`;
}

export function convertUsdtToDisplay(
  amountUsdt: number,
  options?: Pick<MoneyFormatOptions, 'currency' | 'fxRate'>,
): number {
  const currency = options?.currency ?? 'USDT';
  const fxRate = options?.fxRate ?? 1;
  return currency === 'BRL' ? amountUsdt * fxRate : amountUsdt;
}
