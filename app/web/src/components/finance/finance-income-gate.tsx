'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';
import { DashboardSkeleton } from '@/components/ui/dashboard-skeleton';
import { useProfileQuery } from '@/hooks/use-profile-query';
import { typeClass, typeToneClass } from '@/lib/typography';

type FinanceIncomeGateProps = {
  children: ReactNode;
};

function toNumber(value: string | number | null | undefined) {
  if (value == null) return 0;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function FinanceIncomeGate({ children }: FinanceIncomeGateProps) {
  const profile = useProfileQuery();
  const user = profile.data.user;
  const hasMonthlyIncome = toNumber(user?.monthlyIncome) > 0;

  if (profile.data.loading) return <DashboardSkeleton />;
  if (hasMonthlyIncome) return <>{children}</>;

  return (
    <div className="flex h-full min-h-0 items-center justify-center p-4">
      <Card className="flex w-full max-w-xl flex-col gap-4 p-6 text-center">
        <div className="space-y-2">
          <p className={cn(typeClass.title, typeToneClass.default)}>
            Set your monthly salary
          </p>
          <p className={cn(typeClass.body, typeToneClass.muted60)}>
            The finance area depends on your salary to calculate budget, remaining balance,
            goals, cards, and transactions consistently.
          </p>
          {profile.data.loadError ? (
            <p className={cn(typeClass.caption, typeToneClass.negative)}>
              {profile.data.loadError}
            </p>
          ) : null}
        </div>
        <Link
          href="/perfil"
          className={cn(
            'inline-flex h-10 items-center justify-center rounded-md bg-red px-4 text-on-accent transition hover:bg-layer2-half hover:text-text',
            typeClass.bodyStrong,
          )}
        >
          Go to profile
        </Link>
      </Card>
    </div>
  );
}
