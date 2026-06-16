import type { WalletCurrency, WalletInvestmentTab } from '@/types/wallet';

const STORAGE_KEY = 'new-era.wallet.preferences';

export type WalletPreferences = {
  currency: WalletCurrency;
  investmentTab: WalletInvestmentTab;
};

const VALID_CURRENCIES = new Set<WalletCurrency>(['USDT', 'BRL']);
const VALID_TABS = new Set<WalletInvestmentTab>(['stocks', 'crypto', 'etfs', 'mine']);

export const DEFAULT_WALLET_PREFERENCES: WalletPreferences = {
  currency: 'USDT',
  investmentTab: 'stocks',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseWalletPreferences(raw: string | null): WalletPreferences {
  if (!raw) return DEFAULT_WALLET_PREFERENCES;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return DEFAULT_WALLET_PREFERENCES;

    const currency = VALID_CURRENCIES.has(parsed.currency as WalletCurrency)
      ? (parsed.currency as WalletCurrency)
      : DEFAULT_WALLET_PREFERENCES.currency;

    const rawTab = parsed.investmentTab as WalletInvestmentTab | 'others';
    const investmentTab =
      rawTab === 'others'
        ? 'mine'
        : VALID_TABS.has(rawTab)
          ? rawTab
          : DEFAULT_WALLET_PREFERENCES.investmentTab;

    return { currency, investmentTab };
  } catch {
    return DEFAULT_WALLET_PREFERENCES;
  }
}

let cachedRaw: string | null = null;
let cachedSnapshot: WalletPreferences = DEFAULT_WALLET_PREFERENCES;

export function invalidateWalletPreferencesCache() {
  cachedRaw = null;
}

/** Stable snapshot for useSyncExternalStore (client). */
export function readWalletPreferences(): WalletPreferences {
  if (typeof window === 'undefined') {
    return DEFAULT_WALLET_PREFERENCES;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) {
    return cachedSnapshot;
  }

  cachedRaw = raw;
  cachedSnapshot = parseWalletPreferences(raw);
  return cachedSnapshot;
}

export function writeWalletPreferences(patch: Partial<WalletPreferences>): WalletPreferences {
  const next = { ...readWalletPreferences(), ...patch };

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    cachedRaw = JSON.stringify(next);
    cachedSnapshot = next;
  }

  return next;
}
