'use client';

import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';
import type { DietMacroSegmentVm } from '@/types/diet';

type DietMacroDonutProps = {
  data: {
    totalKcalLabel: string;
    segments: DietMacroSegmentVm[];
  };
  className?: string;
};

export function DietMacroDonut({ data, className }: DietMacroDonutProps) {
  const r = 50;
  const c = 2 * Math.PI * r;
  const hasSplit = data.segments.length > 0;

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

  const kcalValue = data.totalKcalLabel.replace(/\s*Kcal$/i, '').trim();
  const kcalNumber = Number(kcalValue.replace(/,/g, ''));
  const isZero = !Number.isFinite(kcalNumber) || kcalNumber <= 0;

  return (
    <div className={cn('relative mx-auto aspect-square w-[9.5rem] shrink-0', className)}>
      <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120" aria-hidden>
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="var(--color-layer2)"
          strokeWidth="11"
          strokeLinecap="butt"
        />
        {arcs.map((arc) => (
          <circle
            key={arc.key}
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke={arc.color}
            strokeWidth="11"
            strokeDasharray={`${arc.dash} ${arc.gap}`}
            strokeDashoffset={arc.offset}
            strokeLinecap="butt"
          />
        ))}
      </svg>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-3 text-center">
        <span
          className={cn(
            'leading-none tabular-nums tracking-tight',
            typeClass.stat,
            isZero ? 'text-text/35' : typeToneClass.accent,
          )}
        >
          {kcalValue}
        </span>
        <span
          className={cn(
            'mt-1 uppercase tracking-wider',
            typeClass.overline,
            isZero ? typeToneClass.muted60 : typeToneClass.accent,
          )}
        >
          kcal
        </span>
      </div>
    </div>
  );
}
