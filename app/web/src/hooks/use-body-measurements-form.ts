'use client';

import { useEffect, useMemo, useState } from 'react';
import { toastAuthError, toastUpdated } from '@/lib/app-toast';
import { type UpdateLatestBodyMeasureInput, updateLatestBodyMeasure } from '@/services/body-measure';
import { HttpError } from '@/services/http';
import { CRUD_TOAST } from '@/utils/crud-toast-messages';
import {
  MEASUREMENT_FORM_FIELDS,
  MEASUREMENT_INPUT_BASE_CLASS,
  MEASUREMENT_SAVED_FIELD_TEXT,
} from '@/types/body-metrics';
import {
  buildMeasurementRowsVm,
  flatMeasurementDraftsFromRecord,
  normalizeCircumferenceDraft,
  normalizeCmCompare,
} from '@/utils/body-measure-drafts';
import type { BodyMeasureQueryState } from '@/hooks/use-body-measure-query';

export function useBodyMeasurementsForm(query: BodyMeasureQueryState) {
  const [measurementDraftsByField, setMeasurementDraftsByField] = useState<Record<string, string>>({});
  const [measurementsBaselineByField, setMeasurementsBaselineByField] = useState<Record<string, string>>({});
  const [measurementsSaving, setMeasurementsSaving] = useState(false);

  useEffect(() => {
    if (query.loadingHeader) return;
    const flat = flatMeasurementDraftsFromRecord(query.measureRecord);
    setMeasurementDraftsByField(flat);
    setMeasurementsBaselineByField(flat);
  }, [query.loadingHeader, query.measureRecord, query.measureSyncSignature]);

  const hasMeasurementsUnsaved = useMemo(
    () =>
      MEASUREMENT_FORM_FIELDS.some(
        (k) =>
          normalizeCmCompare(measurementDraftsByField[k] ?? '') !==
          normalizeCmCompare(measurementsBaselineByField[k] ?? ''),
      ),
    [measurementDraftsByField, measurementsBaselineByField],
  );

  const rows = useMemo(
    () => buildMeasurementRowsVm(measurementDraftsByField, measurementsBaselineByField),
    [measurementDraftsByField, measurementsBaselineByField],
  );

  async function saveMeasurements() {
    if (measurementsSaving || query.loadingHeader || !hasMeasurementsUnsaved) return;

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
      if (measure) query.setMeasureRecord(measure);
      toastUpdated(CRUD_TOAST.measurementsUpdated);
    } catch (error) {
      const message =
        error instanceof HttpError && error.message ? error.message : 'Não foi possível salvar as medidas.';
      toastAuthError(message);
    } finally {
      setMeasurementsSaving(false);
    }
  }

  return {
    measurementsUi: {
      rows,
      hasUnsavedChanges: hasMeasurementsUnsaved,
      saving: measurementsSaving,
      loading: query.loadingHeader,
      savedFieldTextClass: MEASUREMENT_SAVED_FIELD_TEXT,
      inputBaseClass: MEASUREMENT_INPUT_BASE_CLASS,
    },
    setMeasurementDraft: (field: string, value: string) =>
      setMeasurementDraftsByField((prev) => ({
        ...prev,
        [field]: normalizeCircumferenceDraft(value),
      })),
    saveMeasurements,
  };
}
