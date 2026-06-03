'use client';

import type { HealthVitalRow } from '@/hooks/use-body-metrics-dashboard-state';
import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';

type HealthVitalsCardProps = {
  data: {
    title: string;
    rows: HealthVitalRow[];
  };
  className?: string;
};

export function HealthVitalsCard({ data, className }: HealthVitalsCardProps) {
  return (
    <Card className={cn('flex h-full min-h-0 flex-col p-5 lg:p-6', className)}>
      <p className="text-lg font-semibold text-text">{data.title}</p>

      <div className="scrollbar-none mt-4 min-h-0 flex-1 overflow-auto pr-1">
        <div className="grid grid-cols-1 gap-2.5">
          {data.rows.map((row) => (
            <div key={row.key} className="rounded-xl bg-layer2-half px-5 py-4">
              <p className="text-xs font-medium uppercase tracking-wide text-text/60">{row.label}</p>
              <p className="mt-2 text-base font-semibold text-text">{row.valueLabel}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

