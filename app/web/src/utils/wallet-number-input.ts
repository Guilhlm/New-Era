import { formatWalletAmountDraft } from '@/utils/wallet';

/** Allows digits plus locale decimal/thousand separators while typing. */
export function normalizeDecimalDraft(value: string): string {
  return value.replace(/[^\d.,]/g, '');
}

/**
 * Parses amounts typed in pt-BR (64.870,00), en-US (64,870.00) or plain digits (6487000).
 */
export function parseLocaleAmount(value: string): number | null {
  const trimmed = value.trim().replace(/\s/g, '');
  if (!trimmed) return null;

  const cleaned = trimmed.replace(/[$R]/gi, '');
  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');

  let normalized: string;

  if (lastComma > -1 && lastDot > -1) {
    normalized =
      lastComma > lastDot
        ? cleaned.replace(/\./g, '').replace(',', '.')
        : cleaned.replace(/,/g, '');
  } else if (lastComma > -1) {
    normalized = cleaned.replace(',', '.');
  } else if (lastDot > -1) {
    const parts = cleaned.split('.');
    const lastPart = parts[parts.length - 1] ?? '';
    if (parts.length === 2 && lastPart.length <= 2) {
      normalized = cleaned;
    } else {
      normalized = cleaned.replace(/\./g, '');
    }
  } else {
    normalized = cleaned;
  }

  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

/**
 * Parses share quantities (dot/comma as decimal: 0,008376 / 1.008678).
 */
export function parseLocaleShares(value: string): number | null {
  const trimmed = value.trim().replace(/\s/g, '');
  if (!trimmed) return null;

  const cleaned = trimmed.replace(/[^\d.,]/g, '');
  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');

  let normalized: string;

  if (lastComma > -1 && lastDot > -1) {
    normalized =
      lastComma > lastDot
        ? cleaned.replace(/\./g, '').replace(',', '.')
        : cleaned.replace(/,/g, '');
  } else if (lastComma > -1) {
    normalized = cleaned.replace(',', '.');
  } else {
    normalized = cleaned;
  }

  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

export function formatAmountDraft(value: number): string {
  return formatWalletAmountDraft(value);
}

export function formatSharesDraft(value: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 8,
  });
}

export function formatAmountHint(value: string): string | null {
  const parsed = parseLocaleAmount(value);
  if (parsed == null || value.trim().length < 4) return null;
  return formatAmountDraft(parsed);
}
