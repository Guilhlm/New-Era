import { Decimal } from '@prisma/client/runtime/library';

export function roundUsdt(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000;
}

export function walletDisplayToCents(display: number): number {
  const normalized = Math.round(display * 100) / 100;
  return Math.round(normalized * 100);
}

export function brlCentsFromUsdt(usdt: number, rate: number): number {
  return Math.round(usdt * rate * 100);
}

export const MIN_ACTIVE_POSITION_SHARES = 0.000001;
const MIN_TRADE_SHARES = MIN_ACTIVE_POSITION_SHARES;

export function isActivePosition(shares: number): boolean {
  return shares > MIN_ACTIVE_POSITION_SHARES;
}
const SHARE_STEP = 0.000001;

export function roundShares(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000;
}

/**
 * Sizes a buy from a USDT budget and live price, fitting to wallet display cents.
 */
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
        ? roundShares(options.shares) * priceUsdt
        : 0,
  );

  if (requestedBudget <= 0 || walletDisplayToCents(requestedBudget) > balanceCents) {
    throw new Error('Insufficient wallet balance.');
  }

  const budgetUsdt = roundUsdt(Math.min(requestedBudget, balance));

  let fittedShares = roundShares(budgetUsdt / priceUsdt);
  while (
    fittedShares >= MIN_TRADE_SHARES &&
    walletDisplayToCents(roundUsdt(fittedShares * priceUsdt)) > balanceCents
  ) {
    fittedShares = roundShares(fittedShares - SHARE_STEP);
  }

  const debitUsdt = roundUsdt(Math.min(roundUsdt(fittedShares * priceUsdt), balance));

  if (fittedShares < MIN_TRADE_SHARES || walletDisplayToCents(debitUsdt) > balanceCents) {
    throw new Error('Insufficient wallet balance.');
  }

  return { shares: fittedShares, debitUsdt };
}

/** Resolve debit in USDT using the same 2-decimal rules as the UI. */
export function resolveDebitUsdt(
  amount: number,
  currency: 'USDT' | 'BRL',
  balance: number,
  fxRate: number,
): number {
  const balanceRounded = roundUsdt(balance);

  if (currency === 'USDT') {
    const amountUsdt = roundUsdt(amount);
    if (walletDisplayToCents(amountUsdt) > walletDisplayToCents(balanceRounded)) {
      throw new Error('Insufficient wallet balance.');
    }
    return Math.min(amountUsdt, balanceRounded);
  }

  if (fxRate <= 0) {
    throw new Error('FX rate unavailable.');
  }

  const requiredBrlCents = walletDisplayToCents(amount);
  const availableBrlCents = brlCentsFromUsdt(balanceRounded, fxRate);
  if (requiredBrlCents > availableBrlCents) {
    throw new Error('Insufficient wallet balance.');
  }

  return Math.min(roundUsdt(amount / fxRate), balanceRounded);
}

export function toNumber(value: Decimal | number | string | null | undefined | unknown): number {
  if (value == null) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value);
  if (typeof value === 'object' && value !== null && 'toNumber' in value) {
    return (value as Decimal).toNumber();
  }
  return Number(value);
}

export function deriveInvestmentValues(input: {
  shares: number;
  avgPrice: number;
  currentPrice: number;
}) {
  const shares = input.shares;
  const costValue = shares * input.avgPrice;
  const currentValue = shares * input.currentPrice;

  return {
    shares,
    avgPrice: input.avgPrice,
    currentPrice: input.currentPrice,
    costValue,
    currentValue,
  };
}

export function computeGain(currentValue: number, costValue: number) {
  const gainAmount = currentValue - costValue;
  const gainPct = costValue > 0 ? (gainAmount / costValue) * 100 : 0;
  return { gainAmount, gainPct };
}
