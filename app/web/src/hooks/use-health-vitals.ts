'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import {
  type UpdateLatestBodyVitalInput,
  getLatestBodyVital,
  updateLatestBodyVital,
} from '@/services/body-measure';
import { toastAuthError, toastUpdated } from '@/lib/app-toast';
import { queryKeys } from '@/lib/query-keys';
import { HttpError } from '@/services/http';
import {
  HEALTH_VITAL_DEFS,
  HEALTH_VITAL_FIELDS,
  type HealthVitalField,
  type HealthVitalRow,
} from '@/types/body-metrics';
import {
  draftsFromVital,
  emptyVitalDrafts,
  formatVitalValueLabel,
  normalizeDecimalDraft,
  normalizeIntegerDraft,
  normalizeVitalCompare,
  parseNumeric,
} from '@/utils/body-vital-format';
import { CRUD_TOAST } from '@/utils/crud-toast-messages';

type VitalDrafts = Record<HealthVitalField, string>;

function buildRows(saved: VitalDrafts, editing: boolean, drafts: VitalDrafts): HealthVitalRow[] {
  return HEALTH_VITAL_DEFS.map((def) => {
    const savedValue = saved[def.field];
    const draftValue = editing ? drafts[def.field] : savedValue;

    return {
      key: def.key,
      field: def.field,
      label: def.label,
      valueLabel: formatVitalValueLabel(def.field, savedValue),
      draft: draftValue,
      inputMode: def.inputMode,
      placeholder: def.placeholder,
    };
  });
}

function normalizeDraft(field: HealthVitalField, value: string): string {
  const def = HEALTH_VITAL_DEFS.find((item) => item.field === field);
  if (!def) return value;
  return def.inputMode === 'numeric' ? normalizeIntegerDraft(value) : normalizeDecimalDraft(value);
}

function toPayloadValue(field: HealthVitalField, draft: string): number | null {
  const def = HEALTH_VITAL_DEFS.find((item) => item.field === field);
  const kind = def?.inputMode === 'numeric' ? 'numeric' : 'decimal';
  const normalized = normalizeVitalCompare(draft, kind);
  if (!normalized) return null;
  const n = parseNumeric(normalized);
  if (n == null) return null;
  return def?.inputMode === 'numeric' ? Math.round(n) : n;
}

export function useHealthVitals() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState<VitalDrafts>(emptyVitalDrafts());
  const [drafts, setDrafts] = useState<VitalDrafts>(emptyVitalDrafts());
  const [syncSignature, setSyncSignature] = useState('');

  const query = useQuery({
    queryKey: queryKeys.bodyVitalLatest,
    queryFn: getLatestBodyVital,
    retry: 3,
  });

  const vitalRecord = query.data?.vital ?? null;

  useEffect(() => {
    if (query.isPending) return;
    const next = draftsFromVital(vitalRecord);
    setSaved(next);
    if (!editing) setDrafts(next);
  }, [vitalRecord, query.isPending, editing]);

  const saveMutation = useMutation({
    mutationFn: (payload: UpdateLatestBodyVitalInput) => updateLatestBodyVital(payload),
    onSuccess: ({ vital }) => {
      queryClient.setQueryData(queryKeys.bodyVitalLatest, { vital });
      void queryClient.invalidateQueries({ queryKey: queryKeys.bodyVitalHistory });
      const next = draftsFromVital(vital);
      setSaved(next);
      setDrafts(next);
      setEditing(false);
      setSyncSignature(String(Date.now()));
      toastUpdated(CRUD_TOAST.healthVitalsUpdated);
    },
    onError: (error) => {
      const message =
        error instanceof HttpError && error.message ? error.message : 'Não foi possível salvar os vitals.';
      toastAuthError(message);
    },
  });

  const dirty = useMemo(() => {
    const result = {} as Record<HealthVitalField, boolean>;
    for (const field of HEALTH_VITAL_FIELDS) {
      const def = HEALTH_VITAL_DEFS.find((item) => item.field === field);
      const kind = def?.inputMode === 'numeric' ? 'numeric' : 'decimal';
      result[field] =
        normalizeVitalCompare(drafts[field], kind) !== normalizeVitalCompare(saved[field], kind);
    }
    return result;
  }, [drafts, saved]);

  const hasDirty = useMemo(
    () => HEALTH_VITAL_FIELDS.some((field) => dirty[field]),
    [dirty],
  );

  const rows = useMemo(() => buildRows(saved, editing, drafts), [drafts, editing, saved]);

  async function save() {
    const payload: UpdateLatestBodyVitalInput = {};
    for (const field of HEALTH_VITAL_FIELDS) {
      if (!dirty[field]) continue;
      payload[field] = toPayloadValue(field, drafts[field]);
    }
    if (Object.keys(payload).length === 0) return;
    await saveMutation.mutateAsync(payload);
  }

  async function toggleEdit() {
    if (!editing) {
      setEditing(true);
      return;
    }

    if (!hasDirty) {
      setEditing(false);
      setDrafts(saved);
      return;
    }

    await save();
  }

  return {
    data: {
      rows,
      editing,
      loading: query.isPending,
      saving: saveMutation.isPending,
      dirty,
      hasDirty,
      syncSignature,
    },
    actions: {
      toggleEdit,
      setVitalDraft: (field: HealthVitalField, value: string) =>
        setDrafts((prev) => ({ ...prev, [field]: normalizeDraft(field, value) })),
    },
  };
}
