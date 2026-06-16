'use client';

import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';
import type { WalletAllocationSegmentVm, WalletCurrency } from '@/types/wallet';
import { formatWalletAmount, formatWalletPercent } from '@/utils/wallet';

type WalletAllocationBarProps = {
  data: {
    centerPct: number;
    centerCaption: string;
    segments: WalletAllocationSegmentVm[];
  };
  ui?: {
    activeKey?: string | null;
    currency?: WalletCurrency;
  };
  actions?: {
    onActiveKeyChange?: (key: string | null) => void;
  };
  className?: string;
};

export function WalletAllocationBar({ data, ui, actions, className }: WalletAllocationBarProps) {
  const activeKey = ui?.activeKey ?? null;
  const activeSegment = data.segments.find((segment) => segment.key === activeKey) ?? null;
  const amountOpts = { currency: ui?.currency ?? 'USDT', alreadyConverted: true as const };

  return (
    <div className={cn('w-full min-w-0', className)}>
      <div className={cn('mb-2 flex min-w-0 items-center justify-between gap-2', typeClass.caption)}>
        <span className="truncate">Total allocation</span>
        {activeSegment ? (
          <span className={cn('shrink-0', typeClass.bodyStrong, typeToneClass.default)}>
            {activeSegment.label}{' '}
            <span className={typeToneClass.accent}>{formatWalletPercent(activeSegment.pct)}</span>
          </span>
        ) : (
          <span className={cn('shrink-0', typeClass.bodyStrong, typeToneClass.accent)}>
            {data.centerPct.toLocaleString('en-US', {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}
            %
          </span>
        )}
      </div>

      <div
        className="flex h-4 w-full min-w-0 items-stretch overflow-hidden rounded-full bg-layer2"
        role="img"
        aria-label="Portfolio allocation bar"
      >
        {data.segments.map((segment) => {
          const isActive = activeKey === segment.key;
          const isDimmed = activeKey !== null && !isActive;

          return (
            <button
              key={segment.key}
              type="button"
              className={cn(
                'block min-h-0 min-w-[2px] shrink-0 self-stretch border-0 p-0 leading-none appearance-none cursor-pointer transition-opacity duration-150',
                isDimmed && 'opacity-35',
                isActive && 'opacity-100',
              )}
              style={{
                width: `${segment.pct}%`,
                backgroundColor: segment.color,
              }}
              title={`${segment.label}: ${formatWalletAmount(segment.value, amountOpts)} (${formatWalletPercent(segment.pct)})`}
              aria-label={`${segment.label} ${formatWalletPercent(segment.pct)}`}
              onMouseEnter={() => actions?.onActiveKeyChange?.(segment.key)}
              onMouseLeave={() => actions?.onActiveKeyChange?.(null)}
              onFocus={() => actions?.onActiveKeyChange?.(segment.key)}
              onBlur={() => actions?.onActiveKeyChange?.(null)}
            />
          );
        })}
      </div>
    </div>
  );
}
