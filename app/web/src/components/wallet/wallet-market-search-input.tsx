'use client';

import { useEffect, useRef } from 'react';
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

const toolbarControlClass = 'h-10 shrink-0';

export function WalletMarketSearchInput({
  tab,
  disabled = false,
  className,
  onSelect,
}: WalletMarketSearchInputProps) {
  const { query, setQuery, results, loading, open, setOpen, selectResult } = useMarketAssetSearch({
    tab,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [setOpen]);

  return (
    <div ref={containerRef} className={cn('relative min-w-[11rem] flex-1 sm:max-w-[16rem]', className)}>
      <input
        type="search"
        value={query}
        disabled={disabled}
        placeholder="Search asset…"
        className={cn(
          toolbarControlClass,
          'w-full rounded-md border border-grey/60 bg-layer2 px-3 outline-none placeholder:text-text/40 focus-visible:ring-2 focus-visible:ring-red/60',
          typeClass.micro,
        )}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => {
          if (results.length > 0 || loading) setOpen(true);
        }}
      />

      {open && (loading || results.length > 0) ? (
        <div className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-md border border-grey/60 bg-layer1 shadow-lg">
          {loading ? (
            <p className={cn('px-3 py-2', typeClass.caption, typeToneClass.muted60)}>Searching…</p>
          ) : (
            results.map((result) => (
              <button
                key={result.coinId ?? `${result.ticker}-${result.name}`}
                type="button"
                className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left hover:bg-layer2-half"
                onClick={() => onSelect(selectResult(result))}
              >
                <span className={cn('truncate', typeClass.bodyStrong, typeToneClass.default)}>
                  {result.ticker}
                </span>
                <span className={cn('truncate', typeClass.caption, typeToneClass.muted60)}>
                  {result.name}
                </span>
              </button>
            ))
          )}
        </div>
      ) : null}

      {open && !loading && query.trim().length > 0 && results.length === 0 ? (
        <div className="absolute z-30 mt-1 w-full rounded-md border border-grey/60 bg-layer1 px-3 py-2 shadow-lg">
          <p className={cn(typeClass.caption, typeToneClass.muted60)}>No assets found.</p>
        </div>
      ) : null}
    </div>
  );
}
