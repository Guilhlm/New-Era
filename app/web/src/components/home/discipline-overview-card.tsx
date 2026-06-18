'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';
import { DisciplineRing } from '@/components/perfil/discipline-ring';
import { typeClass, typeToneClass } from '@/lib/typography';
import { MdInfoOutline } from 'react-icons/md';

type DisciplineOverviewCardProps = {
  percent: number;
  label: string;
  subtitle?: string;
  segments?: {
    total: number;
    filled: number;
  };
  style?: React.CSSProperties;
};

export function DisciplineOverviewCard({
  percent,
  label,
  subtitle = 'Almost there',
  segments = { total: 0, filled: 0 },
  style,
}: DisciplineOverviewCardProps) {
  const filled = Math.min(segments.total, Math.max(0, segments.filled));
  const tooltipId = 'discipline-info-tooltip';

  return (
    <Card
      className="flex h-full min-h-0 items-center gap-10 px-6 py-5 lg:px-7 lg:py-4"
      style={style}
    >
      <DisciplineRing percent={Math.min(100, Math.max(0, percent))} value={label} caption="" />

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-3">
          <div className="min-w-0">
            <p className={cn('truncate', typeClass.title, 'text-[color:var(--color-text-60)]')}>Discipline Level</p>
            <p className={cn(typeClass.body, typeToneClass.accent)}>{subtitle}</p>
          </div>
          <div className="group relative ml-auto -translate-y-3">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-layer2-half text-text/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red/60"
              aria-label="Information about Discipline"
              aria-describedby={tooltipId}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <MdInfoOutline className="h-5 w-5" aria-hidden />
            </button>
            <div className={cn('pointer-events-none absolute right-0 top-11 z-50 hidden w-56 rounded-md bg-layer2 px-5 py-5 shadow-md group-hover:block group-focus-within:block', typeClass.caption, 'text-grey')}>
              <div id={tooltipId} role="tooltip" className="leading-relaxed">
                The level of discipline reflects the proportion of daily tasks completed.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex w-full items-center justify-between gap-1">
          {Array.from({ length: segments.total }).map((_, i) => {
            const active = i < filled;
            return (
              <span
                key={i}
                className={cn(
                  'h-2 flex-1 rounded-full',
                  active ? 'bg-red' : 'bg-layer2',
                )}
                aria-hidden
              />
            );
          })}
        </div>
      </div>
    </Card>
  );
}
