'use client';

import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';
import type { DietMacroSegmentVm } from '@/types/diet';

type DietMacroDonutProps = {
  data: {
    totalKcalLabel: string;
    segments: DietMacroSegmentVm[];
  };
};

export function DietMacroDonut({ data }: DietMacroDonutProps) {
  const r = 52;
  const c = 2 * Math.PI * r;

  const arcs = data.segments.reduce<
    Array<{ key: string; color: string; dash: number; gap: number; offset: number }>
  >((acc, segment) => {
    const dash = c * (segment.percentOfTotal / 100);
    const offset = acc.length === 0 ? 0 : acc[acc.length - 1]!.offset - acc[acc.length - 1]!.dash;
    acc.push({
      key: segment.key,
      color: segment.color,
      dash,
      gap: c - dash,
      offset,
    });
    return acc;
  }, []);

  return (
    <div className="relative mx-auto h-44 w-44">
      <svg className="-rotate-90" viewBox="0 0 120 120" width="176" height="176" aria-hidden>
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--color-layer2)" strokeWidth="10" />
        {arcs.map((arc) => (
          <circle
            key={arc.key}
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke={arc.color}
            strokeWidth="10"
            strokeDasharray={`${arc.dash} ${arc.gap}`}
            strokeDashoffset={arc.offset}
            strokeLinecap="butt"
          />
        ))}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-2 text-center">
        <span className={cn('leading-tight', typeClass.title, typeToneClass.default)}>
          {data.totalKcalLabel.replace(/\s*Kcal$/i, '')}
          <span className={typeClass.caption}>Kcal</span>
        </span>
      </div>
    </div>
  );
}
