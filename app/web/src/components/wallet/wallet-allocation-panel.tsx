'use client';

import { useState } from 'react';
import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';
import type { WalletAllocationSegmentVm, WalletCurrency } from '@/types/wallet';
import { formatWalletAmount, formatWalletPercent } from '@/utils/wallet';
import { WalletAllocationBar } from '@/components/wallet/wallet-allocation-bar';

type WalletAllocationLegendProps = {
  segments: WalletAllocationSegmentVm[];
  currency?: WalletCurrency;
  fxRate?: number;
  activeKey?: string | null;
  onActiveKeyChange?: (key: string | null) => void;
  className?: string;
};

function WalletAllocationLegend({
  segments,
  currency = 'USDT',
  fxRate = 1,
  activeKey,
  onActiveKeyChange,
  className,
}: WalletAllocationLegendProps) {
  const amountOpts = { currency, alreadyConverted: true as const };
  return (
    <div className={cn('min-w-0 overflow-hidden px-0.5 py-1', className)}>
      <div className={cn('mb-1.5 grid grid-cols-[minmax(0,1fr)_auto] gap-2 px-0.5', typeClass.overline, 'text-text/45')}>
        <span>Asset</span>
        <span className="text-right">Value</span>
      </div>

      <ul className="divide-y divide-grey/60">
        {segments.map((segment) => {
          const isActive = activeKey === segment.key;
          const isDimmed = activeKey != null && !isActive;
          const valueLabel = formatWalletAmount(segment.value, amountOpts);

          return (
            <li key={segment.key} className="min-w-0">
              <button
                type="button"
                className={cn(
                  'grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-lg px-0.5 py-1.5 text-left transition',
                  isActive && 'bg-layer2-half',
                  isDimmed && 'opacity-45',
                )}
                onMouseEnter={() => onActiveKeyChange?.(segment.key)}
                onMouseLeave={() => onActiveKeyChange?.(null)}
                onFocus={() => onActiveKeyChange?.(segment.key)}
                onBlur={() => onActiveKeyChange?.(null)}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full ring-1 ring-grey/25"
                    style={{ backgroundColor: segment.color }}
                    aria-hidden
                  />
                  <span className="min-w-0">
                    <span className={cn('block truncate', typeClass.label, typeToneClass.default)}>{segment.label}</span>
                    <span className={cn('block truncate', typeClass.caption, 'text-text/45')}>
                      {formatWalletPercent(segment.pct)}
                    </span>
                  </span>
                </span>

                <span
                  className={cn('max-w-[5.75rem] truncate text-right text-text/85', typeClass.micro, typeToneClass.default)}
                  title={valueLabel}
                >
                  {valueLabel}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

type WalletAllocationPanelProps = {
  data: {
    centerPct: number;
    centerCaption: string;
    segments: WalletAllocationSegmentVm[];
  };
  ui?: {
    currency?: WalletCurrency;
    fxRate?: number;
  };
  className?: string;
};

export function WalletAllocationPanel({ data, className, ui }: WalletAllocationPanelProps) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const amountOpts = {
    currency: ui?.currency ?? 'USDT',
    alreadyConverted: true as const,
  };

  return (
    <div className={cn('flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden', className)}>
      <WalletAllocationBar
        data={data}
        ui={{ activeKey, ...amountOpts }}
        actions={{ onActiveKeyChange: setActiveKey }}
      />

      <WalletAllocationLegend
        segments={data.segments}
        currency={ui?.currency}
        fxRate={ui?.fxRate}
        activeKey={activeKey}
        onActiveKeyChange={setActiveKey}
        className="mt-auto w-full min-w-0"
      />
    </div>
  );
}
