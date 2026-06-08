'use client';

import { useEffect, useState } from 'react';
import { searchFoods } from '@/services/diet';
import type { FoodSearchResult } from '@/types/foods';

type UseFoodSearchOptions = {
  debounceMs?: number;
  minQueryLength?: number;
  limit?: number;
};

export function useFoodSearch({
  debounceMs = 400,
  minQueryLength = 2,
  limit = 8,
}: UseFoodSearchOptions = {}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (query.trim().length < minQueryLength) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = window.setTimeout(() => {
      void searchFoods(query.trim(), limit)
        .then(({ results: next }) => {
          setResults(next);
          setOpen(true);
        })
        .catch(() => {
          setResults([]);
          setOpen(true);
        })
        .finally(() => setLoading(false));
    }, debounceMs);

    return () => window.clearTimeout(timer);
  }, [query, debounceMs, minQueryLength, limit]);

  function selectFood(food: FoodSearchResult) {
    setQuery('');
    setResults([]);
    setOpen(false);
    return food;
  }

  return {
    query,
    setQuery,
    results,
    loading,
    open,
    setOpen,
    selectFood,
  };
}
