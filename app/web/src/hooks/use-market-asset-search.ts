'use client';

import { useEffect, useState } from 'react';
import { searchMarketAssets } from '@/services/finance';
import type { MarketSearchResultRecord } from '@/types/finance';
import type { WalletInvestmentTab } from '@/types/wallet';

type UseMarketAssetSearchOptions = {
  tab: WalletInvestmentTab;
  debounceMs?: number;
  minQueryLength?: number;
  limit?: number;
};

export function useMarketAssetSearch({
  tab,
  debounceMs = 350,
  minQueryLength = 1,
  limit = 8,
}: UseMarketAssetSearchOptions) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MarketSearchResultRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setQuery('');
    setResults([]);
    setOpen(false);
  }, [tab]);

  useEffect(() => {
    if (query.trim().length < minQueryLength) {
      setResults([]);
      setLoading(false);
      setOpen(false);
      return;
    }

    setLoading(true);
    const timer = window.setTimeout(() => {
      void searchMarketAssets(tab, query.trim())
        .then(({ results: next }) => {
          const seen = new Set<string>();
          const deduped = next.filter((item) => {
            const key = item.coinId ?? item.ticker.toUpperCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          setResults(deduped.slice(0, limit));
          setOpen(true);
        })
        .catch(() => {
          setResults([]);
          setOpen(true);
        })
        .finally(() => setLoading(false));
    }, debounceMs);

    return () => window.clearTimeout(timer);
  }, [query, tab, debounceMs, minQueryLength, limit]);

  function selectResult(result: MarketSearchResultRecord) {
    setQuery('');
    setResults([]);
    setOpen(false);
    return result;
  }

  return {
    query,
    setQuery,
    results,
    loading,
    open,
    setOpen,
    selectResult,
  };
}
