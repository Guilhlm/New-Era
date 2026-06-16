import type { LatestBodyMeasure } from '@/services/body-measure';

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
  field: HealthVitalField;
  label: string;
  valueLabel: string;
  draft: string;
  inputMode: 'decimal' | 'numeric';
  placeholder: string;
};

export type HealthVitalField =
  | 'restingHeartRate'
  | 'bodyWater'
  | 'basalMetabolicRate'
  | 'bodyFat'
  | 'leanMass'
  | 'boneMass'
  | 'maxHeartRate'
  | 'hydrationLevel'
  | 'sleepHours';

export type HealthVitalDef = {
  field: HealthVitalField;
  key: string;
  label: string;
  inputMode: 'decimal' | 'numeric';
  placeholder: string;
};

export const HEALTH_VITAL_DEFS: HealthVitalDef[] = [
  {
    field: 'restingHeartRate',
    key: 'hr',
    label: 'Heart Rate',
    inputMode: 'numeric',
    placeholder: '0 Bpm',
  },
  {
    field: 'bodyWater',
    key: 'water',
    label: 'Body Water',
    inputMode: 'decimal',
    placeholder: '0%',
  },
  {
    field: 'basalMetabolicRate',
    key: 'tbm',
    label: 'Tbm',
    inputMode: 'numeric',
    placeholder: '0 Kcal',
  },
  {
    field: 'bodyFat',
    key: 'fat',
    label: 'Body Fat',
    inputMode: 'decimal',
    placeholder: '0%',
  },
  {
    field: 'leanMass',
    key: 'lean',
    label: 'Lean Mass',
    inputMode: 'decimal',
    placeholder: '0 Kg',
  },
  {
    field: 'boneMass',
    key: 'bone',
    label: 'Bone Mass',
    inputMode: 'decimal',
    placeholder: '0 Kg',
  },
  {
    field: 'maxHeartRate',
    key: 'max_hr',
    label: 'Max Heart Rate',
    inputMode: 'numeric',
    placeholder: '0 Bpm',
  },
  {
    field: 'hydrationLevel',
    key: 'hydration',
    label: 'Hydration',
    inputMode: 'decimal',
    placeholder: '0%',
  },
  {
    field: 'sleepHours',
    key: 'sleep',
    label: 'Sleep',
    inputMode: 'decimal',
    placeholder: '0 h',
  },
];

export const HEALTH_VITAL_FIELDS: HealthVitalField[] = HEALTH_VITAL_DEFS.map((def) => def.field);

export type MetricField = keyof NonNullable<LatestBodyMeasure>;

export type MeasurementDef =
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

export const BODY_MEASUREMENT_DEFS: MeasurementDef[] = [
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

export const MEASUREMENT_SAVED_FIELD_TEXT = 'text-text-60';
export const MEASUREMENT_INPUT_BASE_CLASS =
  'input-no-native-spin min-h-0 min-w-0 flex-1 cursor-text type-body outline-none placeholder:text-text/35';

export const MEASUREMENT_FORM_FIELDS: MetricField[] = BODY_MEASUREMENT_DEFS.flatMap((def) =>
  def.layout === 'single' ? [def.field] : [def.leftField, def.rightField],
);

export type MeasurementChartOption = {
  field: MetricField;
  label: string;
};

export const MEASUREMENT_CHART_OPTIONS: MeasurementChartOption[] = BODY_MEASUREMENT_DEFS.flatMap((def) => {
  if (def.layout === 'single') {
    return [{ field: def.field, label: def.label }];
  }
  return [
    { field: def.leftField, label: `${def.label} (E)` },
    { field: def.rightField, label: `${def.label} (D)` },
  ];
});

export type EvolutionChartOption = {
  id: string;
  label: string;
  group: 'Measurements' | 'Health Vitals';
  source: 'measure' | 'vital';
  field: MetricField | HealthVitalField;
};

export const EVOLUTION_CHART_OPTIONS: EvolutionChartOption[] = [
  ...MEASUREMENT_CHART_OPTIONS.map((option) => ({
    id: `measure:${option.field}`,
    label: option.label,
    group: 'Measurements' as const,
    source: 'measure' as const,
    field: option.field,
  })),
  {
    id: 'measure:weight',
    label: 'Weight',
    group: 'Health Vitals' as const,
    source: 'measure' as const,
    field: 'weight',
  },
  ...HEALTH_VITAL_DEFS.map((def) => ({
    id: `vital:${def.field}`,
    label: def.label,
    group: 'Health Vitals' as const,
    source: 'vital' as const,
    field: def.field,
  })),
];

export const EVOLUTION_CHART_GROUPS = ['Measurements', 'Health Vitals'] as const;
