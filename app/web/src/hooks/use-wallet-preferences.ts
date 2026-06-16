import { useCallback, useSyncExternalStore } from 'react';
import type { WalletCurrency, WalletInvestmentTab } from '@/types/wallet';
import {
  DEFAULT_WALLET_PREFERENCES,
  invalidateWalletPreferencesCache,
  readWalletPreferences,
  writeWalletPreferences,
} from '@/utils/wallet-preferences';

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);

  const onStorage = (event: StorageEvent) => {
    if (event.key === 'new-era.wallet.preferences') {
      invalidateWalletPreferencesCache();
      callback();
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', onStorage);
  }

  return () => {
    listeners.delete(callback);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', onStorage);
    }
  };
}

function notifyWalletPreferencesChange() {
  for (const listener of listeners) {
    listener();
  }
}

function getServerWalletPreferencesSnapshot() {
  return DEFAULT_WALLET_PREFERENCES;
}

export function persistWalletPreferences(patch: {
  currency?: WalletCurrency;
  investmentTab?: WalletInvestmentTab;
}) {
  writeWalletPreferences(patch);
  notifyWalletPreferencesChange();
}

export function useWalletPreferences() {
  const preferences = useSyncExternalStore(
    subscribe,
    () => readWalletPreferences(),
    getServerWalletPreferencesSnapshot,
  );

  const setCurrency = useCallback((currency: WalletCurrency) => {
    persistWalletPreferences({ currency });
  }, []);

  const setInvestmentTab = useCallback((investmentTab: WalletInvestmentTab) => {
    persistWalletPreferences({ investmentTab });
  }, []);

  return {
    currency: preferences.currency,
    investmentTab: preferences.investmentTab,
    setCurrency,
    setInvestmentTab,
  };
}
