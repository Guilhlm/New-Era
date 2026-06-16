import type { WalletCurrency } from '@/types/wallet';
import {
  convertUsdtToDisplay as convertUsdtToDisplayMoney,
  formatAssetPrice,
  formatMoney,
  formatMoneyDraft,
  formatPercent,
  MONEY_LOCALE,
  roundDisplayAmount,
} from './money-format';

const USDT_EPSILON = 1e-8;
export const WALLET_AMOUNT_LOCALE = MONEY_LOCALE;
export const MAX_FINANCE_USDT = 1_000_000_000;

export function roundUsdt(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000;
}

export function clampFinanceUsdt(value: number, ceiling = MAX_FINANCE_USDT): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return roundUsdt(Math.min(value, ceiling));
}

/** Converts a user-entered display amount to USDT (base ledger currency). */
export function displayAmountToUsdt(
  amountDisplay: number,
  currency: WalletCurrency = 'USDT',
  fxRate = 1,
): number {
  if (currency === 'BRL') {
    if (fxRate <= 0) return 0;
    return roundUsdt(amountDisplay / fxRate);
  }
  return roundUsdt(amountDisplay);
}

/** Converts USDT (ledger) back to the display currency shown in forms. */
export function usdtToDisplayAmount(
  amountUsdt: number,
  currency: WalletCurrency = 'USDT',
  fxRate = 1,
): number {
  if (currency === 'BRL') {
    if (fxRate <= 0) return 0;
    return roundWalletDisplayAmount(amountUsdt * fxRate);
  }
  return roundUsdt(amountUsdt);
}

/** Normalizes deposit/withdraw payload amount (display currency) for the API. */
export function resolveCashSubmitAmount(
  parsedAmount: number,
  options: {
    currency: WalletCurrency;
    fxRate: number;
    mode: 'deposit' | 'withdraw';
    availableUsdt?: number;
  },
): number | null {
  const { currency, fxRate, mode, availableUsdt = 0 } = options;

  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return null;
  if (currency === 'BRL' && fxRate <= 0) return null;

  const requiredDisplay = roundWalletDisplayAmount(parsedAmount);
  let amountUsdt = displayAmountToUsdt(requiredDisplay, currency, fxRate);
  if (amountUsdt <= 0) return null;

  if (mode === 'withdraw') {
    amountUsdt = resolveSpendUsdt(amountUsdt, availableUsdt, {
      currency,
      fxRate,
      requiredDisplay,
    });
    if (amountUsdt <= 0) return null;
  }

  amountUsdt = clampFinanceUsdt(amountUsdt);
  if (amountUsdt <= 0) return null;

  const submitAmount = usdtToDisplayAmount(amountUsdt, currency, fxRate);
  if (submitAmount <= 0 || submitAmount > MAX_FINANCE_USDT) return null;

  return submitAmount;
}

export const roundWalletDisplayAmount = roundDisplayAmount;
export const formatWalletAmountDraft = formatMoneyDraft;
export const convertUsdtToDisplay = convertUsdtToDisplayMoney;

export function formatWalletAmount(
  value: number,
  options?: {
    signed?: boolean;
    currency?: WalletCurrency;
    fxRate?: number;
    alreadyConverted?: boolean;
  },
): string {
  return formatMoney(value, options);
}

/** Asset live/avg price — up to 8 fraction digits for micro-cap crypto quotes. */
export function formatWalletAssetPrice(
  value: number,
  options?: {
    signed?: boolean;
    currency?: WalletCurrency;
    fxRate?: number;
    alreadyConverted?: boolean;
  },
): string {
  return formatAssetPrice(value, options);
}

export function formatWalletPercent(value: number, options?: { signed?: boolean }): string {
  return formatPercent(value, options);
}

export function walletAmountToBrlCents(usdt: number, fxRate: number): number {
  return Math.round(usdt * fxRate * 100);
}

/** Same 2-decimal normalization used by formatWalletAmount. */
export function walletDisplayToCents(display: number): number {
  return Math.round(roundWalletDisplayAmount(display) * 100);
}

/** Compare balances in the same currency the user sees (BRL or USDT cents). */
export function isInsufficientWalletBalance(
  requiredUsdt: number,
  availableUsdt: number,
  options?: {
    currency?: WalletCurrency;
    fxRate?: number;
    requiredDisplay?: number;
  },
): boolean {
  const fxRate = options?.fxRate ?? 1;
  const currency = options?.currency ?? 'USDT';

  if (currency === 'BRL' && fxRate > 0) {
    const requiredCents =
      options?.requiredDisplay != null
        ? walletDisplayToCents(options.requiredDisplay)
        : walletAmountToBrlCents(roundUsdt(requiredUsdt), fxRate);
    const availableCents = walletAmountToBrlCents(availableUsdt, fxRate);
    return requiredCents > availableCents;
  }

  if (options?.requiredDisplay != null) {
    return (
      walletDisplayToCents(options.requiredDisplay) > walletDisplayToCents(availableUsdt)
    );
  }

  return roundUsdt(requiredUsdt) > roundUsdt(availableUsdt) + USDT_EPSILON;
}

/** USDT to debit/charge without exceeding wallet after display rounding. */
export function resolveSpendUsdt(
  requiredUsdt: number,
  availableUsdt: number,
  options?: {
    currency?: WalletCurrency;
    fxRate?: number;
    requiredDisplay?: number;
  },
): number {
  if (isInsufficientWalletBalance(requiredUsdt, availableUsdt, options)) {
    return 0;
  }

  const available = roundUsdt(availableUsdt);
  const currency = options?.currency ?? 'USDT';
  const fxRate = options?.fxRate ?? 1;

  if (currency === 'BRL' && fxRate > 0) {
    const availableCents = walletAmountToBrlCents(available, fxRate);
    const requiredCents =
      options?.requiredDisplay != null
        ? walletDisplayToCents(options.requiredDisplay)
        : walletAmountToBrlCents(roundUsdt(requiredUsdt), fxRate);
    if (requiredCents >= availableCents) {
      return available;
    }
  } else if (options?.requiredDisplay != null) {
    if (
      walletDisplayToCents(options.requiredDisplay) >= walletDisplayToCents(available)
    ) {
      return available;
    }
  }

  return roundUsdt(Math.min(roundUsdt(requiredUsdt), available));
}

const MIN_TRADE_SHARES = 0.000001;
const SHARE_STEP = 0.000001;

export function roundTradeShares(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000;
}

/** Same rules as API resolveBuyTrade — fits shares to displayed balance. */
export function resolveBuyTrade(
  priceUsdt: number,
  balanceUsdt: number,
  options?: { budgetUsdt?: number; shares?: number },
): { shares: number; debitUsdt: number } {
  if (priceUsdt <= 0) {
    throw new Error('Market price unavailable.');
  }

  const balance = roundUsdt(balanceUsdt);
  const balanceCents = walletDisplayToCents(balance);

  if (balanceCents <= 0) {
    throw new Error('Insufficient wallet balance.');
  }

  const requestedBudget = roundUsdt(
    options?.budgetUsdt != null
      ? options.budgetUsdt
      : options?.shares != null
        ? roundTradeShares(options.shares) * priceUsdt
        : 0,
  );

  if (requestedBudget <= 0 || walletDisplayToCents(requestedBudget) > balanceCents) {
    throw new Error('Insufficient wallet balance.');
  }

  const budgetUsdt = roundUsdt(Math.min(requestedBudget, balance));

  let fittedShares = roundTradeShares(budgetUsdt / priceUsdt);
  while (
    fittedShares >= MIN_TRADE_SHARES &&
    walletDisplayToCents(roundUsdt(fittedShares * priceUsdt)) > balanceCents
  ) {
    fittedShares = roundTradeShares(fittedShares - SHARE_STEP);
  }

  const debitUsdt = roundUsdt(Math.min(roundUsdt(fittedShares * priceUsdt), balance));

  if (fittedShares < MIN_TRADE_SHARES || walletDisplayToCents(debitUsdt) > balanceCents) {
    throw new Error('Insufficient wallet balance.');
  }

  return { shares: fittedShares, debitUsdt };
}

export function tryResolveBuyTrade(
  priceUsdt: number,
  balanceUsdt: number,
  options?: { budgetUsdt?: number; shares?: number },
): { shares: number; debitUsdt: number } | null {
  try {
    return resolveBuyTrade(priceUsdt, balanceUsdt, options);
  } catch {
    return null;
  }
}

export function formatWalletCompactAmount(
  value: number,
  options?: { currency?: WalletCurrency; fxRate?: number },
): string {
  const currency = options?.currency ?? 'USDT';
  const rate = currency === 'BRL' ? (options?.fxRate ?? 1) : 1;
  const converted = roundWalletDisplayAmount(value * rate);
  const prefix = currency === 'BRL' ? 'R$' : '$';

  if (converted >= 1_000_000) {
    return `${prefix} ${(converted / 1_000_000).toFixed(1)}M`;
  }
  if (converted >= 1_000) {
    return `${prefix} ${(converted / 1_000).toFixed(1)}K`;
  }
  return formatWalletAmount(value, options);
}

export function buildAllocationConicGradient(segments: { pct: number; color: string }[]): string {
  let cursor = 0;
  const stops = segments.map((segment) => {
    const start = cursor;
    cursor += segment.pct;
    return `${segment.color} ${start}% ${cursor}%`;
  });
  return `conic-gradient(from -90deg, ${stops.join(', ')})`;
}

export type WalletDonutSegmentPath = {
  key: string;
  label: string;
  value: number;
  pct: number;
  color: string;
  path: string;
};

function polarToCartesian(cx: number, cy: number, radius: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

function describeDonutArc(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number,
) {
  const startOuter = polarToCartesian(cx, cy, outerR, endAngle);
  const endOuter = polarToCartesian(cx, cy, outerR, startAngle);
  const startInner = polarToCartesian(cx, cy, innerR, startAngle);
  const endInner = polarToCartesian(cx, cy, innerR, endAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;

  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 0 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 1 ${endInner.x} ${endInner.y}`,
    'Z',
  ].join(' ');
}

export function buildDonutSegmentPaths(
  segments: { key: string; label: string; value: number; pct: number; color: string }[],
  options?: { cx?: number; cy?: number; outerR?: number; innerR?: number },
): WalletDonutSegmentPath[] {
  const cx = options?.cx ?? 50;
  const cy = options?.cy ?? 50;
  const outerR = options?.outerR ?? 48;
  const innerR = options?.innerR ?? 30;

  let cursor = 0;

  return segments.map((segment) => {
    const startAngle = cursor;
    const sweep = (segment.pct / 100) * 360;
    cursor += sweep;

    return {
      ...segment,
      path: describeDonutArc(cx, cy, outerR, innerR, startAngle, cursor),
    };
  });
}
