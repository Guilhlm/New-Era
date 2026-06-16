'use client';

import type { ReactNode } from 'react';
import { cn } from '@/components/ui/cn';

type DashboardTwoColumnLayoutProps = {
  children: ReactNode;
  className?: string;
  topRowMinHeight?: string;
};

export function DashboardTwoColumnLayout({
  children,
  className,
  topRowMinHeight = '14rem',
}: DashboardTwoColumnLayoutProps) {
  return (
    <section
      className={cn(
        'flex h-full min-h-0 flex-1 flex-col gap-2.5 lg:grid lg:min-h-0 lg:flex-1 lg:gap-2.5',
        className,
      )}
      style={{
        gridTemplateColumns: 'minmax(0, 2.65fr) minmax(0, 1fr)',
        gridTemplateRows: `${topRowMinHeight} minmax(0, 1fr)`,
      }}
    >
      {children}
    </section>
  );
}

export function dashboardGridArea(column: 'main' | 'sidebar', row: 'header' | 'body') {
  const col = column === 'main' ? '1 / 2' : '2 / 3';
  const gridRow = row === 'header' ? '1 / 2' : '2 / 3';
  return { gridColumn: col, gridRow };
}
