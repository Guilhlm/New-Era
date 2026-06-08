import type { LatestBodyMeasure } from '@/services/body-measure';
import type { MeasurementRowVm } from '@/types/body-metrics';
import {
  BODY_MEASUREMENT_DEFS,
  MEASUREMENT_FORM_FIELDS,
  MEASUREMENT_SAVED_FIELD_TEXT,
} from '@/types/body-metrics';

function normalizeDecimalDraft(value: string) {
  return value.replace(',', '.').replace(/[^\d.]/g, '');
}

export function measureNum(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = typeof value === 'number' ? value : parseFloat(String(value).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

function canonicalCmNumericString(s: string): string {
  const n = measureNum(normalizeDecimalDraft(String(s).trim()));
  if (n === null) return '';
  const scaled = Math.round(n * 10);
  if (!Number.isFinite(scaled)) return '';
  if (scaled % 10 === 0) return String(scaled / 10);
  return (scaled / 10).toFixed(1);
}

function cmDraftFromDb(value: unknown): string {
  if (value === null || value === undefined || value === '') return '';
  const s = String(value).trim();
  if (!s) return '';
  return canonicalCmNumericString(s);
}

export function flatMeasurementDraftsFromRecord(record: LatestBodyMeasure | null): Record<string, string> {
  const obj: Record<string, string> = {};
  for (const k of MEASUREMENT_FORM_FIELDS) {
    const v = record?.[k as keyof NonNullable<LatestBodyMeasure>];
    obj[k] = cmDraftFromDb(v);
  }
  return obj;
}

export function normalizeCircumferenceDraft(value: string): string {
  const cleaned = value.replace(',', '.').replace(/[^\d.]/g, '');
  if (!cleaned) return '';

  const firstDot = cleaned.indexOf('.');
  if (firstDot === -1) {
    return cleaned.replace(/\D/g, '').slice(0, 6);
  }

  const intDigits = cleaned.slice(0, firstDot).replace(/\D/g, '').slice(0, 6);
  const intPart = intDigits.length ? intDigits : '0';

  const afterDot = cleaned.slice(firstDot + 1).replace(/\D/g, '');
  if (!afterDot) return `${intPart}.`;

  if (afterDot.length > 1) {
    const n = measureNum(`${intPart}.${afterDot}`);
    if (n !== null) return canonicalCmNumericString(`${n}`);
  }

  const decPart = afterDot.slice(0, 1);
  return `${intPart}.${decPart}`;
}

export function normalizeCmCompare(s: string): string {
  const raw = normalizeDecimalDraft(String(s).trim());
  if (!raw) return '';
  const withoutTrailingDot = raw.endsWith('.') ? raw.slice(0, -1) : raw;
  if (!withoutTrailingDot.length) return '';
  return canonicalCmNumericString(withoutTrailingDot);
}

function getMeasurementTone(current: string, baseline: string): string {
  return normalizeCmCompare(current) === normalizeCmCompare(baseline)
    ? MEASUREMENT_SAVED_FIELD_TEXT
    : 'text-red';
}

function percentFromDraftCm(draftRaw: string, maxCm: number): number {
  const n = measureNum(normalizeDecimalDraft(draftRaw.trim()));
  if (n === null || maxCm <= 0) return 0;
  return Math.min(100, Math.max(0, (n / maxCm) * 100));
}

function combineBilateralDraftPercent(leftDraft: string, rightDraft: string, maxCm: number) {
  const pl = percentFromDraftCm(leftDraft, maxCm);
  const pr = percentFromDraftCm(rightDraft, maxCm);
  const hl = measureNum(normalizeDecimalDraft(leftDraft.trim())) !== null;
  const hr = measureNum(normalizeDecimalDraft(rightDraft.trim())) !== null;
  if (hl && hr) return (pl + pr) / 2;
  if (hl) return pl;
  if (hr) return pr;
  return 0;
}

export function buildMeasurementRowsVm(
  drafts: Record<string, string>,
  baseline: Record<string, string>,
): MeasurementRowVm[] {
  return BODY_MEASUREMENT_DEFS.map((def) => {
    if (def.layout === 'single') {
      const fd = def.field as string;
      const value = drafts[fd] ?? '';
      const bs = baseline[fd] ?? '';
      return {
        key: def.key,
        label: def.label,
        layout: 'single' as const,
        percent: percentFromDraftCm(value, def.maxCm),
        single: {
          field: fd,
          value,
          toneClass: getMeasurementTone(value, bs),
        },
      };
    }
    const lf = def.leftField as string;
    const rf = def.rightField as string;
    const lv = drafts[lf] ?? '';
    const rv = drafts[rf] ?? '';
    return {
      key: def.key,
      label: def.label,
      layout: 'bilateral' as const,
      percent: combineBilateralDraftPercent(lv, rv, def.maxCm),
      bilateral: {
        left: {
          field: lf,
          value: lv,
          toneClass: getMeasurementTone(lv, baseline[lf] ?? ''),
          ariaLabel: `${def.label} esquerdo (cm)`,
        },
        right: {
          field: rf,
          value: rv,
          toneClass: getMeasurementTone(rv, baseline[rf] ?? ''),
          ariaLabel: `${def.label} direito (cm)`,
        },
      },
    };
  });
}

export function formatNumberLabel(value: string, suffix: string) {
  const trimmed = value.trim();
  if (!trimmed) return `-- ${suffix}`;
  return `${trimmed} ${suffix}`;
}
