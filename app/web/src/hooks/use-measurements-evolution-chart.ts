'use client';

import { useMemo, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import type { MeasurementChartPoint } from '@/utils/measurement-chart';
import {
  buildChartLinePath,
  buildSinglePointLinePath,
  clampChartTooltipPosition,
  findNearestPlottedIndex,
  niceChartBounds,
  prepareChartDisplayPoints,
  toPlottedChartPoints,
  type PlottedChartPoint,
} from '@/utils/measurement-chart';

type ChartHoverState = {
  pointerX: number;
  pointerY: number;
  pointIndex: number;
};

type UseMeasurementsEvolutionChartParams = {
  points: MeasurementChartPoint[];
  formatValue?: (value: number) => string;
};

export function useMeasurementsEvolutionChart({
  points,
  formatValue,
}: UseMeasurementsEvolutionChartParams) {
  const plotAreaRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<ChartHoverState | null>(null);

  const { displayPoints, dateLabelIndices } = useMemo(
    () => prepareChartDisplayPoints(points),
    [points],
  );

  const bounds = useMemo(
    () => niceChartBounds(displayPoints.map((point) => point.value)),
    [displayPoints],
  );

  const plotted = useMemo(
    () => toPlottedChartPoints(displayPoints, bounds.min, bounds.max),
    [bounds.max, bounds.min, displayPoints],
  );

  const activePoint: PlottedChartPoint | null = hover ? (plotted[hover.pointIndex] ?? null) : null;

  const tooltipPosition =
    hover && plotAreaRef.current
      ? clampChartTooltipPosition(
          hover.pointerX,
          hover.pointerY,
          plotAreaRef.current.clientWidth,
          plotAreaRef.current.clientHeight,
        )
      : null;

  const linePath = useMemo(() => buildChartLinePath(plotted), [plotted]);
  const singlePointLinePath = useMemo(
    () => (plotted.length === 1 ? buildSinglePointLinePath(plotted[0]) : null),
    [plotted],
  );

  const formatPointValue = useMemo(
    () => formatValue ?? ((value: number) => value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })),
    [formatValue],
  );

  function handleMouseMove(event: ReactMouseEvent<HTMLDivElement>) {
    if (plotted.length === 0) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const pointerX = event.clientX - rect.left;
    const pointerY = event.clientY - rect.top;
    const xPercent = (pointerX / rect.width) * 100;
    const pointIndex = findNearestPlottedIndex(xPercent, plotted);

    setHover({ pointerX, pointerY, pointIndex });
  }

  function handleMouseLeave() {
    setHover(null);
  }

  return {
    refs: { plotAreaRef },
    data: {
      plotted,
      activePoint,
      tooltipPosition,
      linePath,
      singlePointLinePath,
      dateLabelIndices,
      formatPointValue,
      hasRawPoints: points.length > 0,
      showStaticDots: plotted.length > 1 && plotted.length <= 12 && !activePoint,
    },
    actions: {
      handleMouseMove,
      handleMouseLeave,
    },
  };
}
