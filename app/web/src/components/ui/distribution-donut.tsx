'use client';

import type { ReactNode } from 'react';
import { cn } from '@/components/ui/cn';

export type DistributionDonutSegment = {
  key: string;
  color: string;
  percentOfTotal: number;
};

type DonutArc = {
  key: string;
  color: string;
  dash: number;
  gap: number;
  offset: number;
};

function buildArcs(segments: DistributionDonutSegment[], circumference: number): DonutArc[] {
  return segments.reduce<DonutArc[]>((acc, segment) => {
    const dash = circumference * (segment.percentOfTotal / 100);
    const offset = acc.length === 0 ? 0 : acc[acc.length - 1]!.offset - acc[acc.length - 1]!.dash;
    acc.push({
      key: segment.key,
      color: segment.color,
      dash,
      gap: circumference - dash,
      offset,
    });
    return acc;
  }, []);
}

type DistributionDonutProps = {
  segments: DistributionDonutSegment[];
  /** `fixed` keeps a compact square (diet macros); `fill` stretches to the parent. */
  size?: 'fixed' | 'fill';
  /** Center overlay content (label/value), rendered by the caller. */
  center?: ReactNode;
  /** Center horizontal padding (percentage of width). */
  centerPaddingClassName?: string;
  className?: string;
};

const RADIUS = 50;
const STROKE_WIDTH = 11;

export function DistributionDonut({
  segments,
  size = 'fill',
  center,
  centerPaddingClassName = 'px-3',
  className,
}: DistributionDonutProps) {
  const circumference = 2 * Math.PI * RADIUS;
  const arcs = buildArcs(segments, circumference);

  const outerClass =
    size === 'fixed'
      ? cn('relative mx-auto aspect-square w-[9.5rem] shrink-0', className)
      : cn('flex h-full min-h-0 w-full items-center justify-center', className);

  const Svg = (
    <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120" aria-hidden>
      <circle
        cx="60"
        cy="60"
        r={RADIUS}
        fill="none"
        stroke="var(--color-layer2)"
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="butt"
      />
      {arcs.map((arc) => (
        <circle
          key={arc.key}
          cx="60"
          cy="60"
          r={RADIUS}
          fill="none"
          stroke={arc.color}
          strokeWidth={STROKE_WIDTH}
          strokeDasharray={`${arc.dash} ${arc.gap}`}
          strokeDashoffset={arc.offset}
          strokeLinecap="butt"
        />
      ))}
    </svg>
  );

  if (size === 'fixed') {
    return (
      <div className={outerClass}>
        {Svg}
        <div
          className={cn(
            'pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center',
            centerPaddingClassName,
          )}
        >
          {center}
        </div>
      </div>
    );
  }

  return (
    <div className={outerClass}>
      <div className="relative aspect-square h-full max-h-full w-full max-w-full">
        {Svg}
        <div
          className={cn(
            'pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center',
            centerPaddingClassName,
          )}
        >
          {center}
        </div>
      </div>
    </div>
  );
}
