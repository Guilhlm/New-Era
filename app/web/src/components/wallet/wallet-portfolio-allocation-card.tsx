'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';
import { SegmentedControl, SegmentedControlItem } from '@/components/ui/segmented-control';
import { WalletAllocationPanel } from '@/components/wallet/wallet-allocation-panel';
import { WalletPerformanceChart } from '@/components/wallet/wallet-performance-chart';
import type { WalletAllocationSegmentVm, WalletCurrency, WalletPerformancePeriod } from '@/types/wallet';
import { formatWalletAmount, formatWalletPercent } from '@/utils/wallet';

type WalletPortfolioAllocationCardProps = {
  data: {
    title: string;
    centerPct: number;
    centerCaption: string;
    segments: WalletAllocationSegmentVm[];
    performance: {
      gainAmount: number;
      gainPct: number;
      points: { label: string; value: number }[];
    };
  };
  ui?: {
    period?: WalletPerformancePeriod;
    periods?: WalletPerformancePeriod[];
    loading?: boolean;
    currency?: WalletCurrency;
    fxRate?: number;
  };
  actions?: {
    onPeriodChange?: (period: WalletPerformancePeriod) => void;
  };
  className?: string;
  style?: React.CSSProperties;
};

export function WalletPortfolioAllocationCard({
  data,
  ui,
  actions,
  className,
  style,
}: WalletPortfolioAllocationCardProps) {
  const periods = ui?.periods ?? ['1D', '1W', '1M', '5M', '1Y'];
  const activePeriod = ui?.period ?? '1W';
  const positive = data.performance.gainAmount >= 0;
  const performanceTone = positive ? typeToneClass.positive : typeToneClass.negative;

  return (
    <Card
      className={cn('flex h-full min-h-0 flex-col overflow-hidden px-6 py-5 lg:px-7 lg:py-6', className)}
      style={style}
    >
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 min-w-0">
        <h2 className={cn('min-w-0 truncate', typeClass.title)}>{data.title}</h2>
        <SegmentedControl variant="soft" className="h-9 max-w-full shrink-0 overflow-x-auto">
          {periods.map((period) => (
            <SegmentedControlItem
              key={period}
              active={activePeriod === period}
              className={cn('min-w-10 px-2.5 py-1', typeClass.micro)}
              onClick={() => actions?.onPeriodChange?.(period)}
            >
              {period}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
      </div>

      <div className="mt-4 grid min-h-0 min-w-0 flex-1 gap-4 overflow-hidden lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)] lg:gap-5">
        <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden border-b border-grey pb-4 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-4">
          <WalletAllocationPanel
            data={{
              centerPct: data.centerPct,
              centerCaption: data.centerCaption,
              segments: data.segments,
            }}
            ui={{ currency: ui?.currency, fxRate: ui?.fxRate }}
          />
        </div>

        <div className="flex min-h-0 min-w-0 flex-col overflow-hidden">
          <p className={cn('shrink-0 flex flex-wrap items-center gap-x-4', typeClass.body, 'text-text/70')}>
            <span>Recent Performance:</span>
            <span className={cn('inline-flex items-center gap-x-4', typeClass.bodyStrong, performanceTone)}>
              <span>
                {formatWalletAmount(data.performance.gainAmount, {
                  signed: true,
                  currency: ui?.currency,
                  alreadyConverted: true,
                })}
              </span>
              <span className="text-text/40" aria-hidden>
                |
              </span>
              <span>{formatWalletPercent(data.performance.gainPct, { signed: true })}</span>
            </span>
          </p>

          <div className="relative mt-3 min-h-0 flex-1 overflow-hidden rounded-2xl bg-layer1/20 px-2 py-2">
            <WalletPerformanceChart
              data={{
                points: data.performance.points,
                loading: ui?.loading,
              }}
              ui={{ currency: ui?.currency, alreadyConverted: true }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
