'use client';

import { useEffect, useRef } from 'react';
import { TbShoppingCart } from 'react-icons/tb';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';
import { SegmentedControl, SegmentedControlItem } from '@/components/ui/segmented-control';
import { WalletInvestmentOptionsMenu } from '@/components/wallet/wallet-investment-options-menu';
import { WalletMarketSearchInput } from '@/components/wallet/wallet-market-search-input';
import { useIsClientMounted } from '@/hooks/use-is-client-mounted';
import type { MarketSearchResultRecord } from '@/types/finance';
import type { WalletCurrency, WalletInvestmentRowVm, WalletInvestmentTab } from '@/types/wallet';
import { formatWalletAmount, formatWalletAssetPrice, formatWalletPercent } from '@/utils/wallet';
import { formatPositionShares } from '@/utils/wallet-trade';

function formatMarketUpdatedAt(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

type WalletInvestmentsCardProps = {
  data: {
    title: string;
    rows: WalletInvestmentRowVm[];
    tabs: { id: WalletInvestmentTab; label: string }[];
  };
  ui?: {
    activeTab?: WalletInvestmentTab;
    currency?: WalletCurrency;
    fxRate?: number;
    quotedAt?: string | null;
    total?: number;
    loading?: boolean;
    refreshing?: boolean;
    loadingMore?: boolean;
    hasMore?: boolean;
    highlightedTicker?: string | null;
    stale?: boolean;
  };
  actions?: {
    onTabChange?: (tab: WalletInvestmentTab) => void;
    onCurrencyChange?: (currency: WalletCurrency) => void;
    onRegisterPosition?: () => void;
    onRegisterPositionForRow?: (row: WalletInvestmentRowVm) => void;
    onEditPosition?: (row: WalletInvestmentRowVm) => void;
    onDeletePosition?: (row: WalletInvestmentRowVm) => void;
    onBuyInvestment?: (row: WalletInvestmentRowVm) => void;
    onSellInvestment?: (row: WalletInvestmentRowVm) => void;
    onLoadMore?: () => void;
    onSearchSelect?: (result: MarketSearchResultRecord) => void;
  };
  className?: string;
  style?: React.CSSProperties;
};

function AssetAvatar({ ticker }: { ticker: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-layer2',
        typeClass.micro,
        typeClass.bodyStrong,
        typeToneClass.default,
      )}
    >
      {ticker.slice(0, 2)}
    </span>
  );
}

function InvestmentRowActions({
  row,
  disabled,
  onRegister,
  onBuy,
  onSell,
}: {
  row: WalletInvestmentRowVm;
  disabled?: boolean;
  onRegister?: (row: WalletInvestmentRowVm) => void;
  onBuy?: (row: WalletInvestmentRowVm) => void;
  onSell?: (row: WalletInvestmentRowVm) => void;
}) {
  const canSell = row.hasPosition && row.shares > 0;

  return (
    <div className="inline-flex items-center justify-center gap-1">
      <div className="inline-flex items-center gap-1 rounded-lg bg-layer2-half p-0.5">
        <button
          type="button"
          aria-label={`Buy ${row.ticker}`}
          disabled={Boolean(disabled)}
          className={cn(
            'inline-flex h-7 w-7 items-center justify-center rounded-md transition',
            'bg-red/15 text-red hover:bg-red/25 disabled:opacity-50',
          )}
          onClick={() => onBuy?.(row)}
        >
          <TbShoppingCart className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>

      <div className="inline-flex items-center gap-1 rounded-lg bg-layer2-half p-0.5">
        <WalletInvestmentOptionsMenu
          ticker={row.ticker}
          compact
          disabled={Boolean(disabled)}
          onRegister={() => onRegister?.(row)}
          onSell={() => onSell?.(row)}
          canSell={canSell}
          hasPosition={row.hasPosition}
        />
      </div>
    </div>
  );
}

export function WalletInvestmentsCard({
  data,
  ui,
  actions,
  className,
  style,
}: WalletInvestmentsCardProps) {
  const activeTab = ui?.activeTab ?? data.tabs[0]?.id ?? 'stocks';
  const currency = ui?.currency ?? 'USDT';
  const fxRate = ui?.fxRate ?? 1;
  const amountOpts = { currency, alreadyConverted: true as const };
  const mounted = useIsClientMounted();
  const updatedAtLabel = mounted ? formatMarketUpdatedAt(ui?.quotedAt) : null;
  const interactDisabled = mounted && Boolean(ui?.loading);
  const toolbarControlClass = 'h-10 shrink-0';
  const toolbarSegmentItemClass = cn(
    'inline-flex h-full min-w-[2.75rem] items-center justify-center px-3 py-0',
    typeClass.micro,
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef(new Map<string, HTMLTableRowElement>());

  useEffect(() => {
    const root = scrollRef.current;
    const target = loadMoreRef.current;
    if (!root || !target || !ui?.hasMore || ui.loading || ui.loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          actions?.onLoadMore?.();
        }
      },
      { root, rootMargin: '120px' },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [actions, ui?.hasMore, ui?.loading, ui?.loadingMore, data.rows.length, activeTab]);

  useEffect(() => {
    const ticker = ui?.highlightedTicker;
    if (!ticker) return;
    const row = rowRefs.current.get(ticker.toUpperCase());
    row?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [ui?.highlightedTicker, data.rows.length]);

  return (
    <Card
      className={cn(
        'flex h-full min-h-0 flex-col gap-12 overflow-hidden px-6 py-5 lg:px-7 lg:py-6',
        className,
      )}
      style={style}
    >
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 min-h-10">
        <div className="flex min-w-0 items-center gap-2">
          <h2 className={cn('truncate', typeClass.title)}>{data.title}</h2>
          {updatedAtLabel ? (
            <span className={cn(typeClass.micro, typeToneClass.muted60)}>
              Live · {updatedAtLabel}
            </span>
          ) : null}
          {ui?.refreshing && mounted ? (
            <span className={cn(typeClass.micro, typeToneClass.muted60)}>Updating…</span>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 lg:flex-nowrap">
          <WalletMarketSearchInput
            tab={activeTab}
            disabled={interactDisabled}
            onSelect={(result) => actions?.onSearchSelect?.(result)}
          />
          <SegmentedControl variant="soft" className={cn(toolbarControlClass, 'items-stretch p-0.5')}>
            {(['USDT', 'BRL'] as WalletCurrency[]).map((code) => (
              <SegmentedControlItem
                key={code}
                active={currency === code}
                className={toolbarSegmentItemClass}
                onClick={() => actions?.onCurrencyChange?.(code)}
              >
                {code}
              </SegmentedControlItem>
            ))}
          </SegmentedControl>
          <SegmentedControl variant="soft" className={cn(toolbarControlClass, 'items-stretch p-0.5')}>
            {data.tabs.map((tab) => (
              <SegmentedControlItem
                key={tab.id}
                active={activeTab === tab.id}
                className={toolbarSegmentItemClass}
                onClick={() => actions?.onTabChange?.(tab.id)}
              >
                {tab.label}
              </SegmentedControlItem>
            ))}
          </SegmentedControl>
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={interactDisabled}
            className={cn(toolbarControlClass, 'px-3', typeClass.micro)}
            onClick={() => actions?.onRegisterPosition?.()}
          >
            Register position
          </Button>
        </div>
      </div>

      {ui?.stale ? (
        <p className={cn('-mt-8 shrink-0', typeClass.micro, 'text-amber-600')}>
          Quotes offline — showing last known value.
        </p>
      ) : null}

      {ui?.total != null && data.rows.length > 0 ? (
        <p className={cn('-mt-8 shrink-0', typeClass.micro, typeToneClass.muted60)}>
          Showing {data.rows.length} of {ui.total} assets
        </p>
      ) : null}

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto">
        {ui?.loading && mounted && data.rows.length === 0 ? (
          <div
            className={cn(
              'flex h-full items-center justify-center',
              typeClass.body,
              typeToneClass.muted60,
            )}
          >
            Loading market…
          </div>
        ) : data.rows.length === 0 ? (
          <div
            className={cn(
              'flex h-full items-center justify-center',
              typeClass.body,
              typeToneClass.muted60,
            )}
          >
            No market data available.
          </div>
        ) : (
          <table
            className={cn(
              'w-full min-w-[640px] table-fixed border-collapse [&_td]:align-middle [&_th]:align-middle',
              typeClass.caption,
            )}
          >
            <colgroup>
              <col className="w-[7.25rem]" />
              <col />
            </colgroup>
            <thead>
              <tr className="border-b border-grey text-text/55">
                <th className={cn('pb-3 pr-2 pt-1 text-left', typeClass.label)}>Asset</th>
                <th className="pb-3 pt-1 px-3">
                  <div className="grid grid-cols-6 gap-x-2 text-center">
                    <span className={typeClass.label}>Shares</span>
                    <span className={typeClass.label}>Avg. Price</span>
                    <span className={typeClass.label}>Live Price</span>
                    <span className={typeClass.label}>Value</span>
                    <span className={typeClass.label}>Gain/Loss</span>
                    <span className={typeClass.label}>Actions</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row) => {
                const positive = row.gainAmount >= 0;
                const changePositive = row.changePct24h >= 0;

                return (
                  <tr
                    key={row.ticker}
                    ref={(element) => {
                      if (element) rowRefs.current.set(row.ticker.toUpperCase(), element);
                      else rowRefs.current.delete(row.ticker.toUpperCase());
                    }}
                    className={cn(
                      'border-b border-grey/60',
                      ui?.highlightedTicker?.toUpperCase() === row.ticker.toUpperCase()
                        ? 'bg-red/10'
                        : undefined,
                    )}
                  >
                    <td className="py-3 pr-2">
                      <div className="flex items-center gap-2">
                        <AssetAvatar ticker={row.ticker} />
                        <div className="min-w-0">
                          <p
                            className={cn(
                              'truncate',
                              typeClass.bodyStrong,
                              typeToneClass.default,
                            )}
                          >
                            {row.ticker}
                          </p>
                          <p className={cn('truncate', typeClass.micro, typeToneClass.muted)}>
                            {row.name}
                          </p>
                          <p
                            className={cn(
                              typeClass.micro,
                              changePositive ? typeToneClass.positive : typeToneClass.negative,
                            )}
                          >
                            24h {formatWalletPercent(row.changePct24h, { signed: true })}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="grid grid-cols-6 items-center gap-x-2 text-center">
                        <span className="text-text/80">
                      {row.shares > 0 ? formatPositionShares(row.shares, row.type) : '—'}
                    </span>
                        <span className="text-text/80">
                          {row.hasPosition
                            ? formatWalletAssetPrice(row.avgPrice, amountOpts)
                            : '—'}
                        </span>
                        <span className={typeClass.label}>
                          {formatWalletAssetPrice(row.currentPrice, amountOpts)}
                        </span>
                        <span className={cn(typeClass.label, typeToneClass.default)}>
                          {row.hasPosition
                            ? formatWalletAmount(row.value, amountOpts)
                            : '—'}
                        </span>
                        <div>
              {row.hasPosition && row.priceUsdt > 0 ? (
                            <>
                              <p
                                className={cn(
                                  typeClass.label,
                                  positive ? typeToneClass.positive : typeToneClass.negative,
                                )}
                              >
                                {formatWalletPercent(row.gainPct, { signed: true })}
                              </p>
                              <p
                                className={cn(
                                  typeClass.micro,
                                  positive ? typeToneClass.positive : typeToneClass.negative,
                                )}
                              >
                                {formatWalletAmount(row.gainAmount, { ...amountOpts, signed: true })}
                              </p>
                            </>
                          ) : row.hasPosition && (ui?.refreshing || ui?.loading) ? (
                            <span className={typeToneClass.muted60}>…</span>
                          ) : row.hasPosition ? (
                            <span className={typeToneClass.muted60}>—</span>
                          ) : (
                            <span className={typeToneClass.muted60}>—</span>
                          )}
                        </div>
                        <InvestmentRowActions
                          row={row}
                          disabled={interactDisabled}
                          onRegister={actions?.onRegisterPositionForRow}
                          onBuy={actions?.onBuyInvestment}
                          onSell={actions?.onSellInvestment}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {ui?.hasMore ? (
          <div
            ref={loadMoreRef}
            className={cn(
              'flex items-center justify-center py-4',
              typeClass.caption,
              typeToneClass.muted60,
            )}
          >
            {ui.loadingMore ? 'Loading more assets…' : 'Scroll for more'}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
