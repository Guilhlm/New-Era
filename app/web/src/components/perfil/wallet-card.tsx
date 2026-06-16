'use client';

import Link from 'next/link';
import { RiLayoutGridLine } from 'react-icons/ri';
import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';
import { useWalletFxQuery } from '@/hooks/use-wallet-market-query';
import { useWalletPreferences } from '@/hooks/use-wallet-preferences';
import { useWalletSummaryQuery } from '@/hooks/use-wallet-summary-query';
import { formatWalletAmount } from '@/utils/wallet';
import { mapProfileWalletSegments } from '@/utils/finance-mapper';

type WalletCardProps = {
  balanceUsd?: number;
};

export function WalletCard({ balanceUsd = 0 }: WalletCardProps) {
  const { currency } = useWalletPreferences();
  const fxQuery = useWalletFxQuery();
  const summaryQuery = useWalletSummaryQuery('1W');
  const summary = summaryQuery.data;

  const fxRate = currency === 'BRL' ? (fxQuery.data?.rate ?? 1) : 1;
  const amountOpts = { currency, fxRate };
  const balance = summary?.totalBalance ?? balanceUsd;
  const todayGain = summary?.todayGainAmount ?? 0;
  const segments = summary ? mapProfileWalletSegments(summary, amountOpts) : [];
  const todayTone = todayGain >= 0 ? typeToneClass.positive : typeToneClass.negative;

  return (
    <Card
      className="flex flex-col justify-between px-6 py-6 lg:px-7 lg:py-7"
      style={{ gridColumn: '3 / 5', gridRow: '1 / 2' }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link href="/wallet-investments" className="flex items-center gap-2 text-text transition hover:opacity-80">
          <RiLayoutGridLine className="h-4 w-4 shrink-0 text-red" aria-hidden />
          <h2 className={cn(typeClass.body, 'leading-tight', typeToneClass.accent)}>Investments Wallet</h2>
          <span className={cn('rounded-md bg-layer2 px-1.5 py-0.5', typeClass.micro, typeToneClass.muted60)}>
            {currency}
          </span>
        </Link>
        <p className={cn(typeClass.caption, 'flex items-center gap-[5px]')}>
          <span>Today</span>
          <span className={cn(typeClass.bodyStrong, todayTone)}>
            {formatWalletAmount(todayGain, { signed: true, ...amountOpts })}
          </span>
        </p>
      </div>
      <p className={cn(typeClass.statLg, 'mt-3.5', typeToneClass.default)}>
        {summaryQuery.isLoading ? '…' : formatWalletAmount(balance || 0, amountOpts)}
      </p>
      <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-layer2">
        {segments.length > 0 ? (
          segments.map((segment) => (
            <div
              key={segment.key}
              style={{ width: `${segment.pct}%`, backgroundColor: segment.color }}
              title={segment.label}
            />
          ))
        ) : (
          <div className="h-full w-full bg-layer2-half" />
        )}
      </div>
      <ul className={cn(typeClass.label, 'mt-3 flex flex-wrap gap-3.5 text-text')}>
        {segments.length > 0 ? (
          segments.map((segment) => (
            <li key={segment.key} className="flex items-center gap-2">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: segment.color }}
                aria-hidden
              />
              {segment.label}
            </li>
          ))
        ) : (
          <li className={typeToneClass.muted60}>No investments yet</li>
        )}
      </ul>
    </Card>
  );
}
