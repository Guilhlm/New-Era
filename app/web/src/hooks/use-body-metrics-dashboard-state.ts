import { useEffect, useMemo, useState } from 'react';
import { toastAuthError } from '@/components/auth/auth-error-toast';
import {
  type LatestBodyMeasure,
  type UpdateLatestBodyMeasureInput,
  getLatestBodyMeasure,
  updateLatestBodyMeasure,
} from '@/services/body-measure';
import { HttpError } from '@/services/http';

/** Linha visual do card Measurements + metadados para inputs */
export type MeasurementRowVm = {
  key: string;
  label: string;
  percent: number;
  layout: 'single' | 'bilateral';
  single?: { field: string; value: string; toneClass: string };
  bilateral?: {
    left: { field: string; value: string; toneClass: string; ariaLabel: string };
    right: { field: string; value: string; toneClass: string; ariaLabel: string };
  };
};

export type HealthVitalRow = {
  key: string;
  label: string;
  valueLabel: string;
};

export type BodyMetricsDashboardState = ReturnType<typeof useBodyMetricsDashboardState>;

function formatNumberLabel(value: string, suffix: string) {
  const trimmed = value.trim();
  if (!trimmed) return `-- ${suffix}`;
  return `${trimmed} ${suffix}`;
}

function toDraftString(value: unknown) {
  if (value === null || value === undefined) return '';
  return String(value);
}

function normalizeDecimalDraft(value: string) {
  return value.replace(',', '.').replace(/[^\d.]/g, '');
}

function normalizeWeightDraft(value: string) {
  // Regra:
  // - até 3 dígitos inteiros
  // - ponto opcional (usuário pode digitar)
  // - até 2 casas decimais
  // - se o usuário NÃO digitar ponto e passar de 3 dígitos, o sistema insere o "." após o 3º
  const cleaned = value.replace(',', '.').replace(/[^\d.]/g, '');
  if (!cleaned) return '';

  const hasDot = cleaned.includes('.');
  if (!hasDot) {
    const digits = cleaned.replace(/\D/g, '');
    const intPart = digits.slice(0, 3);
    const decPart = digits.slice(3, 5);
    return decPart ? `${intPart}.${decPart}` : intPart;
  }

  const [rawInt, ...rest] = cleaned.split('.');
  const intPart = (rawInt ?? '').replace(/\D/g, '').slice(0, 3);
  const decPart = rest.join('').replace(/\D/g, '').slice(0, 2);
  return decPart.length ? `${intPart}.${decPart}` : `${intPart}.`;
}

function normalizeInt3Draft(value: string) {
  return value.replace(/\D/g, '').slice(0, 3);
}

function measureNum(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = typeof value === 'number' ? value : parseFloat(String(value).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

/** Comparações e dados vindos do backend: 1 casa decimal, arredondada. */
function canonicalCmNumericString(s: string): string {
  const n = measureNum(normalizeDecimalDraft(String(s).trim()));
  if (n === null) return '';
  const scaled = Math.round(n * 10);
  if (!Number.isFinite(scaled)) return '';
  if (scaled % 10 === 0) return String(scaled / 10);
  return (scaled / 10).toFixed(1);
}

type MetricField = keyof NonNullable<LatestBodyMeasure>;

type MeasurementDef =
  | {
      layout: 'single';
      key: string;
      label: string;
      field: MetricField;
      maxCm: number;
    }
  | {
      layout: 'bilateral';
      key: string;
      label: string;
      leftField: MetricField;
      rightField: MetricField;
      maxCm: number;
    };

/** Ordem das linhas; valores persistidos em `BodyMeasure` no backend. Altura fica só no header. */
const BODY_MEASUREMENT_DEFS: MeasurementDef[] = [
  {
    layout: 'bilateral',
    key: 'biceps',
    label: 'Biceps',
    leftField: 'bicepsLeft',
    rightField: 'bicepsRight',
    maxCm: 55,
  },
  {
    layout: 'bilateral',
    key: 'forearm',
    label: 'Forearm',
    leftField: 'forearmLeft',
    rightField: 'forearmRight',
    maxCm: 45,
  },
  {
    layout: 'bilateral',
    key: 'quad',
    label: 'Quad',
    leftField: 'quadLeft',
    rightField: 'quadRight',
    maxCm: 80,
  },
  {
    layout: 'bilateral',
    key: 'calf',
    label: 'Calf',
    leftField: 'calfLeft',
    rightField: 'calfRight',
    maxCm: 55,
  },
  { layout: 'single', key: 'waist', label: 'Waist', field: 'waist', maxCm: 140 },
  { layout: 'single', key: 'abdomen', label: 'Abdomen', field: 'abdomen', maxCm: 140 },
  { layout: 'single', key: 'chest', label: 'Chest', field: 'chest', maxCm: 140 },
  { layout: 'single', key: 'back', label: 'Back', field: 'back', maxCm: 140 },
  {
    layout: 'single',
    key: 'shoulders',
    label: 'Shoulders',
    field: 'shoulderCircumference',
    maxCm: 160,
  },
  { layout: 'single', key: 'neck', label: 'Neck', field: 'neckCircumference', maxCm: 55 },
];

const MEASUREMENT_SAVED_FIELD_TEXT = 'text-text-60';
const MEASUREMENT_INPUT_BASE_CLASS =
  'input-no-native-spin min-h-0 min-w-0 flex-1 cursor-text text-sm outline-none placeholder:text-text/35';

const MEASUREMENT_FORM_FIELDS: MetricField[] = BODY_MEASUREMENT_DEFS.flatMap((def) =>
  def.layout === 'single' ? [def.field] : [def.leftField, def.rightField],
);

function cmDraftFromDb(value: unknown): string {
  if (value === null || value === undefined || value === '') return '';
  const s = String(value).trim();
  if (!s) return '';
  return canonicalCmNumericString(s);
}

function flatMeasurementDraftsFromRecord(record: LatestBodyMeasure | null): Record<string, string> {
  const obj: Record<string, string> = {};
  for (const k of MEASUREMENT_FORM_FIELDS) {
    const v = record?.[k as keyof NonNullable<LatestBodyMeasure>];
    obj[k] = cmDraftFromDb(v);
  }
  return obj;
}

/** Edição no input: no máx. 1 casa decimal; `42.` mantido enquanto digita. */
function normalizeCircumferenceDraft(value: string): string {
  const cleaned = value.replace(',', '.').replace(/[^\d.]/g, '');
  if (!cleaned) return '';

  const firstDot = cleaned.indexOf('.');
  if (firstDot === -1) {
    return cleaned.replace(/\D/g, '').slice(0, 6);
  }

  const intDigits = cleaned.slice(0, firstDot).replace(/\D/g, '').slice(0, 6);
  const intPart = intDigits.length ? intDigits : '0';

  let afterDot = cleaned.slice(firstDot + 1).replace(/\D/g, '');
  if (!afterDot) return `${intPart}.`;

  if (afterDot.length > 1) {
    const n = measureNum(`${intPart}.${afterDot}`);
    if (n !== null) return canonicalCmNumericString(`${n}`);
  }

  const decPart = afterDot.slice(0, 1);
  return `${intPart}.${decPart}`;
}

function normalizeCmCompare(s: string): string {
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

function buildMeasurementRowsVm(
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

export function useBodyMetricsDashboardState() {
  const [loadingHeader, setLoadingHeader] = useState(true);
  const [editingHeader, setEditingHeader] = useState(false);
  const [saved, setSaved] = useState<{ weight: string; height: string; dateLabel: string }>({
    weight: '',
    height: '',
    dateLabel: '',
  });
  const [measureRecord, setMeasureRecord] = useState<LatestBodyMeasure | null>(null);
  const [drafts, setDrafts] = useState<{ weight: string; height: string }>({ weight: '', height: '' });
  const [measurementDraftsByField, setMeasurementDraftsByField] = useState<Record<string, string>>({});
  const [measurementsBaselineByField, setMeasurementsBaselineByField] = useState<Record<string, string>>({});
  const [measurementsSaving, setMeasurementsSaving] = useState(false);

  const measureSyncSignature = useMemo(() => {
    const m = measureRecord;
    if (!m?.id) return `none_${loadingHeader ? 'loading' : 'idle'}`;
    return `${m.id}_${m.updatedAt ?? ''}_${m.recordedAt ?? ''}`;
  }, [measureRecord, loadingHeader]);

  useEffect(() => {
    if (loadingHeader) return;
    const flat = flatMeasurementDraftsFromRecord(measureRecord);
    setMeasurementDraftsByField(flat);
    setMeasurementsBaselineByField(flat);
  }, [loadingHeader, measureSyncSignature]);

  useEffect(() => {
    let alive = true;
    const run = async () => {
      try {
        const { measure } = await getLatestBodyMeasure();
        if (!alive) return;

        const weight = toDraftString(measure?.weight);
        const height = toDraftString(measure?.height);
        const recordedAt = measure?.recordedAt ? new Date(measure.recordedAt) : null;
        const dateLabel = recordedAt
          ? recordedAt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
          : new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

        setSaved({ weight, height, dateLabel });
        setDrafts({ weight, height });
        setMeasureRecord(measure);
      } catch {
        if (!alive) return;
        const dateLabel = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        setSaved((s) => ({ ...s, dateLabel }));
      } finally {
        if (alive) setLoadingHeader(false);
      }
    };

    // Mesmo padrão de `useProfileQuery`: após navegação client-side o cookie às vezes só fica
    // disponível no próximo task; fetch imediato pode falhar até o F5.
    const id = window.setTimeout(() => {
      void run();
    }, 0);

    return () => {
      alive = false;
      window.clearTimeout(id);
    };
  }, []);

  const dirty = useMemo(
    () => ({
      weight: normalizeWeightDraft(drafts.weight) !== normalizeWeightDraft(saved.weight),
      height: normalizeInt3Draft(drafts.height) !== normalizeInt3Draft(saved.height),
    }),
    [drafts.height, drafts.weight, saved.height, saved.weight],
  );

  const header = useMemo(() => {
    const weightLabel = formatNumberLabel(saved.weight || drafts.weight, 'Kg');
    const heightLabel = formatNumberLabel(saved.height || drafts.height, 'cm');
    return {
      title: 'Body Measurements',
      dateLabel: saved.dateLabel || '—',
      weightLabel: loadingHeader ? '...' : weightLabel,
      heightLabel: loadingHeader ? '...' : heightLabel,
      editing: editingHeader,
      dirty,
      drafts,
    };
  }, [dirty, drafts, editingHeader, loadingHeader, saved.dateLabel, saved.height, saved.weight]);

  const hasMeasurementsUnsaved = useMemo(
    () =>
      MEASUREMENT_FORM_FIELDS.some(
        (k) =>
          normalizeCmCompare(measurementDraftsByField[k] ?? '') !==
          normalizeCmCompare(measurementsBaselineByField[k] ?? ''),
      ),
    [measurementDraftsByField, measurementsBaselineByField],
  );

  const measurementRowsVm = useMemo(
    () => buildMeasurementRowsVm(measurementDraftsByField, measurementsBaselineByField),
    [measurementDraftsByField, measurementsBaselineByField],
  );

  const vitals = useMemo<HealthVitalRow[]>(
    () => [
      { key: 'hr', label: 'Heart Rate', valueLabel: '45 Bpm' },
      { key: 'water', label: 'Body Water', valueLabel: '66,8%' },
      { key: 'tbm', label: 'Tbm', valueLabel: '1534 Kcal' },
      { key: 'fat', label: 'Body Fat', valueLabel: '12,5%' },
      { key: 'hr_2', label: 'Heart Rate', valueLabel: '45 Bpm' },
      { key: 'water_2', label: 'Body Water', valueLabel: '66,8%' },
      { key: 'tbm_2', label: 'Tbm', valueLabel: '1534 Kcal' },
      { key: 'fat_2', label: 'Body Fat', valueLabel: '12,5%' },
    ],
    [],
  );

  const goal = useMemo(
    () => ({
      value: '80 Kilos',
      caption: 'Weight goal',
      percent: 0,
    }),
    [],
  );

  return {
    data: {
      header,
      measurementsUi: {
        rows: measurementRowsVm,
        hasUnsavedChanges: hasMeasurementsUnsaved,
        saving: measurementsSaving,
        loading: loadingHeader,
        savedFieldTextClass: MEASUREMENT_SAVED_FIELD_TEXT,
        inputBaseClass: MEASUREMENT_INPUT_BASE_CLASS,
      },
      vitals,
      goal,
    },
    actions: {
      editMetrics: async () => {
        if (!editingHeader) {
          setEditingHeader(true);
          return;
        }

        // confirm (check): salva se tiver mudança, senão só sai
        if (!dirty.weight && !dirty.height) {
          setEditingHeader(false);
          setDrafts({ weight: saved.weight, height: saved.height });
          return;
        }

        const payload = {
          weight: drafts.weight ? normalizeWeightDraft(drafts.weight) : null,
          height: drafts.height ? normalizeInt3Draft(drafts.height) : null,
        } satisfies UpdateLatestBodyMeasureInput;

        const { measure } = await updateLatestBodyMeasure(payload);
        const nextWeight = toDraftString(measure?.weight ?? payload.weight);
        const nextHeight = toDraftString(measure?.height ?? payload.height);
        setSaved((s) => ({ ...s, weight: nextWeight, height: nextHeight }));
        setDrafts({ weight: nextWeight, height: nextHeight });
        if (measure) setMeasureRecord(measure);
        setEditingHeader(false);
      },
      setHeaderWeightDraft: (value: string) =>
        setDrafts((d) => ({ ...d, weight: normalizeWeightDraft(value) })),
      setHeaderHeightDraft: (value: string) =>
        setDrafts((d) => ({ ...d, height: normalizeInt3Draft(value) })),
      editGoal: () => {},
      setMeasurementDraft: (field: string, value: string) =>
        setMeasurementDraftsByField((prev) => ({
          ...prev,
          [field]: normalizeCircumferenceDraft(value),
        })),
      saveMeasurements: async () => {
        if (measurementsSaving || loadingHeader || !hasMeasurementsUnsaved) return;

        const payload: UpdateLatestBodyMeasureInput = {};
        for (const field of MEASUREMENT_FORM_FIELDS) {
          const d = normalizeCmCompare(measurementDraftsByField[field] ?? '');
          const b = normalizeCmCompare(measurementsBaselineByField[field] ?? '');
          if (d === b) continue;
          (payload as Record<string, unknown>)[field as string] = d === '' ? null : d;
        }
        if (Object.keys(payload).length === 0) return;

        setMeasurementsSaving(true);
        try {
          const { measure } = await updateLatestBodyMeasure(payload);
          if (measure) setMeasureRecord(measure);
          toastAuthError('Medidas salvas.');
        } catch (error) {
          const message =
            error instanceof HttpError && error.message ? error.message : 'Não foi possível salvar as medidas.';
          toastAuthError(message);
        } finally {
          setMeasurementsSaving(false);
        }
      },
    },
    ui: {
      measurementsTitle: 'Measurements',
      vitalsTitle: 'Health Vitals',
    },
  };
}

