'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { toastAuthError, toastUpdated } from '@/lib/app-toast';
import { queryKeys } from '@/lib/query-keys';
import { type UpdateLatestBodyMeasureInput, updateLatestBodyMeasure } from '@/services/body-measure';
import { HttpError } from '@/services/http';
import { CRUD_TOAST } from '@/utils/crud-toast-messages';
import { formatNumberLabel } from '@/utils/body-measure-drafts';
import { normalizeInt3Draft, normalizeWeightDraft, toDraftString } from '@/utils/number-draft';
import type { BodyMeasureQueryState } from '@/hooks/use-body-measure-query';

export function useBodyMeasureHeader(query: BodyMeasureQueryState) {
  const queryClient = useQueryClient();
  const [editingHeader, setEditingHeader] = useState(false);
  const [drafts, setDrafts] = useState({ weight: '', height: '' });

  const dirty = useMemo(
    () => ({
      weight: normalizeWeightDraft(drafts.weight) !== normalizeWeightDraft(query.saved.weight),
      height: normalizeInt3Draft(drafts.height) !== normalizeInt3Draft(query.saved.height),
    }),
    [drafts.height, drafts.weight, query.saved.height, query.saved.weight],
  );

  const header = useMemo(() => {
    const displayWeight = editingHeader ? drafts.weight : query.saved.weight;
    const displayHeight = editingHeader ? drafts.height : query.saved.height;
    const weightLabel = formatNumberLabel(displayWeight, 'Kg');
    const heightLabel = formatNumberLabel(displayHeight, 'cm');
    return {
      title: 'Body Measurements',
      dateLabel: query.saved.dateLabel || '—',
      weightLabel: query.loadingHeader ? '...' : weightLabel,
      heightLabel: query.loadingHeader ? '...' : heightLabel,
      editing: editingHeader,
      dirty,
      drafts: editingHeader ? drafts : { weight: query.saved.weight, height: query.saved.height },
    };
  }, [
    dirty,
    drafts,
    editingHeader,
    query.loadingHeader,
    query.saved.dateLabel,
    query.saved.height,
    query.saved.weight,
  ]);

  async function editMetrics() {
    if (!editingHeader) {
      setDrafts({ weight: query.saved.weight, height: query.saved.height });
      setEditingHeader(true);
      return;
    }

    if (!dirty.weight && !dirty.height) {
      setEditingHeader(false);
      return;
    }

    const payload = {
      weight: drafts.weight ? normalizeWeightDraft(drafts.weight) : null,
      height: drafts.height ? normalizeInt3Draft(drafts.height) : null,
    } satisfies UpdateLatestBodyMeasureInput;

    try {
      const { measure } = await updateLatestBodyMeasure(payload);
      const nextWeight = toDraftString(measure?.weight ?? payload.weight);
      const nextHeight = toDraftString(measure?.height ?? payload.height);
      setDrafts({ weight: nextWeight, height: nextHeight });
      if (measure) query.setMeasureRecord(measure);
      void queryClient.invalidateQueries({ queryKey: queryKeys.bodyMeasureHistory });
      setEditingHeader(false);
      toastUpdated(CRUD_TOAST.measurementsUpdated);
    } catch (error) {
      const message =
        error instanceof HttpError && error.message
          ? error.message
          : 'Não foi possível salvar as medidas.';
      toastAuthError(message);
    }
  }

  return {
    header,
    editMetrics,
    setHeaderWeightDraft: (value: string) =>
      setDrafts((d) => ({ ...d, weight: normalizeWeightDraft(value) })),
    setHeaderHeightDraft: (value: string) =>
      setDrafts((d) => ({ ...d, height: normalizeInt3Draft(value) })),
  };
}
