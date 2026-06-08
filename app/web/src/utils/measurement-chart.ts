import type { LatestBodyMeasure, LatestBodyVital } from '@/services/body-measure';
import type { EvolutionChartOption, HealthVitalField, MetricField } from '@/types/body-metrics';
import { measureNum } from '@/utils/body-measure-drafts';

export type MeasurementChartPoint = {
  id: string;
  label: string;
  value: number;
  recordedAt?: string;
};

/** Máximo de pontos desenhados no gráfico; acima disso aplica LTTB. */
export const CHART_MAX_DISPLAY_POINTS = 20;

/** Máximo de rótulos de data visíveis no eixo inferior. */
export const CHART_MAX_DATE_LABELS = 6;

function formatChartDateLabel(recordedAt?: string) {
  if (!recordedAt) return '—';
  const date = new Date(recordedAt);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function formatChartTooltipDate(recordedAt?: string) {
  if (!recordedAt) return '—';
  const date = new Date(recordedAt);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

const MEASURE_CM_FIELDS = new Set([
  'height',
  'calfRight',
  'calfLeft',
  'quadRight',
  'quadLeft',
  'waist',
  'abdomen',
  'back',
  'chest',
  'shoulderCircumference',
  'neckCircumference',
  'bicepsRight',
  'bicepsLeft',
  'forearmRight',
  'forearmLeft',
]);

export function formatEvolutionTooltipValue(value: number, field: string): string {
  if (field === 'weight' || field === 'leanMass' || field === 'boneMass') {
    return `${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} Kg`;
  }
  if (MEASURE_CM_FIELDS.has(field)) {
    return `${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} cm`;
  }
  if (field === 'restingHeartRate' || field === 'maxHeartRate') {
    return `${Math.round(value)} Bpm`;
  }
  if (field === 'bodyWater' || field === 'bodyFat' || field === 'hydrationLevel') {
    return `${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
  }
  if (field === 'basalMetabolicRate') {
    return `${Math.round(value).toLocaleString('pt-BR')} Kcal`;
  }
  if (field === 'sleepHours') {
    return `${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} h`;
  }
  return value.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
}

export function getChartTooltipDateLabel(point: MeasurementChartPoint): string {
  return formatChartTooltipDate(point.recordedAt) || point.label;
}

export function buildMeasurementChartPoints(
  measures: LatestBodyMeasure[],
  field: MetricField,
): MeasurementChartPoint[] {
  return measures
    .map((measure) => {
      if (!measure?.id) return null;
      const value = measureNum(measure[field]);
      if (value === null) return null;
      return {
        id: measure.id,
        label: formatChartDateLabel(measure.recordedAt),
        value,
        ...(measure.recordedAt ? { recordedAt: measure.recordedAt } : {}),
      };
    })
    .filter((point): point is MeasurementChartPoint => point !== null);
}

export function buildVitalChartPoints(
  vitals: LatestBodyVital[],
  field: HealthVitalField,
): MeasurementChartPoint[] {
  return vitals
    .map((vital) => {
      if (!vital?.id) return null;
      const value = measureNum(vital[field]);
      if (value === null) return null;
      return {
        id: vital.id,
        label: formatChartDateLabel(vital.recordedAt),
        value,
        ...(vital.recordedAt ? { recordedAt: vital.recordedAt } : {}),
      };
    })
    .filter((point): point is MeasurementChartPoint => point !== null);
}

export function buildEvolutionChartPoints(
  measures: LatestBodyMeasure[],
  vitals: LatestBodyVital[],
  option: EvolutionChartOption,
): MeasurementChartPoint[] {
  if (option.source === 'vital') {
    return buildVitalChartPoints(vitals, option.field as HealthVitalField);
  }
  return buildMeasurementChartPoints(measures, option.field as MetricField);
}

/**
 * Largest-Triangle-Three-Buckets — preserva forma da série ao reduzir pontos.
 * @see https://github.com/sveinn-steinarsson/flot-downsample
 */
export function downsampleChartPointsLttb(
  points: MeasurementChartPoint[],
  threshold = CHART_MAX_DISPLAY_POINTS,
): MeasurementChartPoint[] {
  if (points.length <= threshold || threshold < 3) return points;

  const sampled: MeasurementChartPoint[] = [points[0]!];
  const bucketSize = (points.length - 2) / (threshold - 2);
  let previousIndex = 0;

  for (let i = 0; i < threshold - 2; i++) {
    const bucketStart = Math.floor((i + 1) * bucketSize) + 1;
    const bucketEnd = Math.min(Math.floor((i + 2) * bucketSize) + 1, points.length - 1);

    let avgX = 0;
    let avgY = 0;
    let bucketLength = 0;
    for (let j = bucketStart; j < bucketEnd; j++) {
      avgX += j;
      avgY += points[j]!.value;
      bucketLength++;
    }
    if (bucketLength > 0) {
      avgX /= bucketLength;
      avgY /= bucketLength;
    }

    let maxArea = -1;
    let maxIndex = bucketStart;
    const prevValue = points[previousIndex]!.value;

    for (let j = bucketStart; j < bucketEnd; j++) {
      const area = Math.abs(
        (previousIndex - avgX) * (points[j]!.value - prevValue) -
          (previousIndex - j) * (avgY - prevValue),
      );
      if (area > maxArea) {
        maxArea = area;
        maxIndex = j;
      }
    }

    sampled.push(points[maxIndex]!);
    previousIndex = maxIndex;
  }

  sampled.push(points[points.length - 1]!);
  return sampled;
}

/** Índices dos pontos que devem exibir rótulo de data (sempre inclui primeiro e último). */
export function getChartDateLabelIndices(
  pointCount: number,
  maxLabels = CHART_MAX_DATE_LABELS,
): Set<number> {
  if (pointCount <= 0) return new Set();
  if (pointCount <= maxLabels) {
    return new Set(Array.from({ length: pointCount }, (_, index) => index));
  }

  const indices = new Set<number>();
  for (let i = 0; i < maxLabels; i++) {
    indices.add(Math.round((i / (maxLabels - 1)) * (pointCount - 1)));
  }
  return indices;
}

export function findNearestPlottedIndex(xPercent: number, plotted: { xPercent: number }[]): number {
  if (plotted.length === 0) return 0;
  if (plotted.length === 1) return 0;

  let nearestIndex = 0;
  let minDistance = Infinity;
  for (let index = 0; index < plotted.length; index++) {
    const distance = Math.abs(plotted[index]!.xPercent - xPercent);
    if (distance < minDistance) {
      minDistance = distance;
      nearestIndex = index;
    }
  }
  return nearestIndex;
}

export function prepareChartDisplayPoints(points: MeasurementChartPoint[]) {
  const displayPoints = downsampleChartPointsLttb(points);
  const dateLabelIndices = getChartDateLabelIndices(displayPoints.length);
  return { displayPoints, dateLabelIndices };
}

export type PlottedChartPoint = MeasurementChartPoint & {
  xPercent: number;
  yPercent: number;
  index: number;
  isFirst: boolean;
  isLast: boolean;
};

export const CHART_TOOLTIP_WIDTH = 168;
export const CHART_TOOLTIP_HEIGHT = 56;
export const CHART_TOOLTIP_OFFSET = 14;

export function xPercentForIndex(index: number, count: number) {
  if (count <= 1) return 0;
  return (index / (count - 1)) * 100;
}

export function toPlottedChartPoints(
  points: MeasurementChartPoint[],
  min: number,
  max: number,
): PlottedChartPoint[] {
  const span = max - min || 1;

  return points.map((point, index) => {
    const xPercent = xPercentForIndex(index, points.length);
    const yPercent = 100 - ((point.value - min) / span) * 100;
    return {
      ...point,
      xPercent,
      yPercent,
      index,
      isFirst: index === 0,
      isLast: index === points.length - 1,
    };
  });
}

export function buildChartLinePath(plotted: PlottedChartPoint[]): string {
  return plotted
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.xPercent} ${point.yPercent}`)
    .join(' ');
}

export function buildSinglePointLinePath(point: PlottedChartPoint | undefined): string | null {
  if (!point) return null;
  return `M 0 ${point.yPercent} L 100 ${point.yPercent}`;
}

export function clampChartTooltipPosition(
  pointerX: number,
  pointerY: number,
  chartWidth: number,
  chartHeight: number,
) {
  const halfWidth = CHART_TOOLTIP_WIDTH / 2;
  const minX = halfWidth + 4;
  const maxX = chartWidth - halfWidth - 4;
  const left = Math.min(Math.max(pointerX, minX), maxX);

  const fitsAbove = pointerY - CHART_TOOLTIP_HEIGHT - CHART_TOOLTIP_OFFSET > 0;
  const top = fitsAbove
    ? pointerY - CHART_TOOLTIP_HEIGHT - CHART_TOOLTIP_OFFSET
    : Math.min(pointerY + CHART_TOOLTIP_OFFSET, chartHeight - CHART_TOOLTIP_HEIGHT - 4);

  return { left, top };
}

export function niceChartBounds(values: number[]) {
  if (values.length === 0) return { min: 0, max: 100 };

  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  if (rawMin === rawMax) {
    const pad = Math.max(1, rawMin * 0.1);
    return { min: Math.max(0, rawMin - pad), max: rawMax + pad };
  }

  const span = rawMax - rawMin;
  const pad = span * 0.12;
  return {
    min: Math.max(0, rawMin - pad),
    max: rawMax + pad,
  };
}

export function buildChartYTicks(min: number, max: number, count = 5) {
  const span = max - min;
  if (span <= 0) return [min, max];

  const step = span / (count - 1);
  return Array.from({ length: count }, (_, index) => {
    const value = max - step * index;
    return Math.round(value * 10) / 10;
  });
}
