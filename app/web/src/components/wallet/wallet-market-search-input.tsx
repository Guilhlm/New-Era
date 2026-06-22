'use client';

import { AutocompleteSearchInput } from '@/components/ui/autocomplete-search-input';
import { cn } from '@/components/ui/cn';
import { useMarketAssetSearch } from '@/hooks/use-market-asset-search';
import { typeClass, typeToneClass } from '@/lib/typography';
import type { MarketSearchResultRecord } from '@/types/finance';
import type { WalletInvestmentTab } from '@/types/wallet';

type WalletMarketSearchInputProps = {
  tab: WalletInvestmentTab;
  disabled?: boolean;
  className?: string;
  onSelect: (result: MarketSearchResultRecord) => void;
};

export function WalletMarketSearchInput({
  tab,
  disabled = false,
  className,
  onSelect,
}: WalletMarketSearchInputProps) {
  const { query, setQuery, results, loading, open, setOpen, selectResult } = useMarketAssetSearch({
    tab,
  });

  return (
    <AutocompleteSearchInput
      variant="toolbar"
      className={className}
      query={query}
      onQueryChange={setQuery}
      results={results}
      loading={loading}
      open={open}
      onOpenChange={setOpen}
      onSelect={(result) => onSelect(selectResult(result))}
      getKey={(result) => result.coinId ?? `${result.ticker}-${result.name}`}
      placeholder="Search asset…"
      disabled={disabled}
      emptyLabel="No assets found."
      renderItem={(result) => (
        <>
          <span className={cn('truncate', typeClass.bodyStrong, typeToneClass.default)}>
            {result.ticker}
          </span>
          <span className={cn('truncate', typeClass.caption, typeToneClass.muted60)}>
            {result.name}
          </span>
        </>
      )}
    />
  );
}
