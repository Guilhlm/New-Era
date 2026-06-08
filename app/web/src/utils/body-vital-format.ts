import type { LatestBodyVital } from '@/services/body-measure';
import type { HealthVitalField } from '@/types/body-metrics';

export function toDraftString(value: string | number | null | undefined): string {
  if (value == null || value === '') return '';
  return String(value).replace('.', ',');
}

export function parseNumeric(value: string): number | null {
  const trimmed = value.trim().replace(',', '.');
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

export function normalizeDecimalDraft(value: string): string {
  return value.replace(/[^\d,.]/g, '');
}

export function normalizeIntegerDraft(value: string): string {
  return value.replace(/\D/g, '');
}

export function normalizeVitalCompare(value: string, kind: 'decimal' | 'numeric'): string {
  const normalized =
    kind === 'numeric' ? normalizeIntegerDraft(value) : normalizeDecimalDraft(value);
  const n = parseNumeric(normalized);
  if (n == null) return '';
  return kind === 'numeric' ? String(Math.round(n)) : String(n);
}

export function formatPercentLabel(value: string): string {
  const n = parseNumeric(value);
  if (n == null) return '—';
  return `${n.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 })}%`;
}

export function formatBpmLabel(value: string): string {
  const n = parseNumeric(value);
  if (n == null) return '—';
  return `${Math.round(n)} Bpm`;
}

export function formatKcalLabel(value: string): string {
  const n = parseNumeric(value);
  if (n == null) return '—';
  return `${Math.round(n).toLocaleString('pt-BR')} Kcal`;
}

export function formatKgLabel(value: string): string {
  const n = parseNumeric(value);
  if (n == null) return '—';
  return `${n.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 })} Kg`;
}

export function formatHoursLabel(value: string): string {
  const n = parseNumeric(value);
  if (n == null) return '—';
  return `${n.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 })} h`;
}

export function formatVitalValueLabel(field: HealthVitalField, value: string): string {
  switch (field) {
    case 'restingHeartRate':
    case 'maxHeartRate':
      return formatBpmLabel(value);
    case 'bodyWater':
    case 'bodyFat':
    case 'hydrationLevel':
      return formatPercentLabel(value);
    case 'basalMetabolicRate':
      return formatKcalLabel(value);
    case 'leanMass':
    case 'boneMass':
      return formatKgLabel(value);
    case 'sleepHours':
      return formatHoursLabel(value);
    default:
      return '—';
  }
}

export function draftsFromVital(vital: LatestBodyVital): Record<HealthVitalField, string> {
  return {
    restingHeartRate: toDraftString(vital?.restingHeartRate),
    bodyWater: toDraftString(vital?.bodyWater),
    basalMetabolicRate: toDraftString(vital?.basalMetabolicRate),
    bodyFat: toDraftString(vital?.bodyFat),
    leanMass: toDraftString(vital?.leanMass),
    boneMass: toDraftString(vital?.boneMass),
    maxHeartRate: toDraftString(vital?.maxHeartRate),
    hydrationLevel: toDraftString(vital?.hydrationLevel),
    sleepHours: toDraftString(vital?.sleepHours),
  };
}

export function emptyVitalDrafts(): Record<HealthVitalField, string> {
  return {
    restingHeartRate: '',
    bodyWater: '',
    basalMetabolicRate: '',
    bodyFat: '',
    leanMass: '',
    boneMass: '',
    maxHeartRate: '',
    hydrationLevel: '',
    sleepHours: '',
  };
}
