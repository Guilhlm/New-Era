'use client';

import type { ReactNode } from 'react';
import { cn } from '@/components/ui/cn';

type WalletDashboardGridProps = {
  children: ReactNode;
  className?: string;
};

export function WalletDashboardGrid({ children, className }: WalletDashboardGridProps) {
  return (
    <section
      className={cn(
        'flex h-full min-h-0 flex-1 flex-col gap-2.5 lg:grid lg:min-h-0 lg:flex-1 lg:gap-2.5',
        className,
      )}
      style={{
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gridTemplateRows: 'minmax(168px, auto) minmax(0, 1fr) minmax(0, 1fr)',
      }}
    >
      {children}
    </section>
  );
}

export type WalletDashboardGridSlot =
  | 'stat-1'
  | 'stat-2'
  | 'stat-3'
  | 'stat-4'
  | 'main'
  | 'bottom-left'
  | 'bottom-right';

export function walletDashboardGridArea(slot: WalletDashboardGridSlot) {
  const areas: Record<WalletDashboardGridSlot, { gridColumn: string; gridRow: string }> = {
    'stat-1': { gridColumn: '1 / 2', gridRow: '1 / 2' },
    'stat-2': { gridColumn: '2 / 3', gridRow: '1 / 2' },
    'stat-3': { gridColumn: '3 / 4', gridRow: '1 / 2' },
    'stat-4': { gridColumn: '4 / 5', gridRow: '1 / 2' },
    main: { gridColumn: '1 / 5', gridRow: '2 / 3' },
    'bottom-left': { gridColumn: '1 / 4', gridRow: '3 / 4' },
    'bottom-right': { gridColumn: '4 / 5', gridRow: '3 / 4' },
  };

  return areas[slot];
}
