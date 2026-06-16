'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { toastAuthError, toastUpdated } from '@/lib/app-toast';
import { queryKeys } from '@/lib/query-keys';
import { HttpError } from '@/services/http';
import { getWaterLogDay, upsertWaterLogDay, type WaterLogVm } from '@/services/water-log';
import { CRUD_TOAST } from '@/utils/crud-toast-messages';
import {
  computeWaterGlassState,
  formatLiters,
  normalizeWaterTotalDraft,
  weekdayToDateString,
} from '@/utils/water-intake';

function draftFromLog(log: WaterLogVm) {
  return String(log.waterTotal);
}

export function useWaterIntake(selectedWeekday: number) {
  const queryClient = useQueryClient();
  const date = useMemo(() => weekdayToDateString(selectedWeekday), [selectedWeekday]);

  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [savedDraft, setSavedDraft] = useState('3');
  const [draft, setDraft] = useState('3');

  const query = useQuery({
    queryKey: queryKeys.waterLogDay(date),
    queryFn: () => getWaterLogDay(date),
    retry: 3,
  });

  const log = query.data ?? null;

  useEffect(() => {
    if (!log) return;
    const nextDraft = draftFromLog(log);
    setSavedDraft(nextDraft);
    if (!editing) setDraft(nextDraft);
  }, [log, editing]);

  const activeLog = log ?? {
    id: null,
    date,
    waterTotal: 3,
    waterIntake: 0,
    glassCount: 10,
  };

  const { filledCount, glassCount, perGlass } = useMemo(
    () => computeWaterGlassState(activeLog.waterTotal, activeLog.waterIntake),
    [activeLog.waterIntake, activeLog.waterTotal],
  );

  const dirty = useMemo(
    () => normalizeWaterTotalDraft(draft) !== normalizeWaterTotalDraft(savedDraft),
    [draft, savedDraft],
  );

  const upsertMutation = useMutation({
    mutationFn: (patch: { waterTotal?: number; waterIntake?: number }) =>
      upsertWaterLogDay({ date, ...patch }),
    onSuccess: (next) => {
      queryClient.setQueryData(queryKeys.waterLogDay(date), next);
      const nextDraft = draftFromLog(next);
      setSavedDraft(nextDraft);
      setDraft(nextDraft);
    },
    onError: (error) => {
      toastAuthError(error instanceof HttpError ? error.message : 'Could not save water intake.');
    },
  });

  async function persist(
    patch: { waterTotal?: number; waterIntake?: number },
    options?: { showUpdatedToast?: boolean },
  ) {
    setSaving(true);
    try {
      const next = await upsertMutation.mutateAsync(patch);
      if (options?.showUpdatedToast) {
        toastUpdated(CRUD_TOAST.waterIntakeUpdated);
      }
      return next;
    } catch {
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function clickGlass(index: number) {
    if (editing || saving || query.isPending) return;

    const isFilled = index < filledCount;
    const isNextEmpty = index === filledCount;

    if (isNextEmpty) {
      const nextIntake = Math.min(
        activeLog.waterTotal,
        Number((activeLog.waterIntake + perGlass).toFixed(2)),
      );
      if (nextIntake <= activeLog.waterIntake) return;
      await persist({ waterIntake: nextIntake }, { showUpdatedToast: true });
      return;
    }

    if (!isFilled) return;

    const nextIntake = Math.max(0, Number((index * perGlass).toFixed(2)));
    if (nextIntake >= activeLog.waterIntake) return;
    await persist({ waterIntake: nextIntake }, { showUpdatedToast: true });
  }

  function cancelEdit() {
    if (query.isPending || saving) return;
    setDraft(savedDraft);
    setEditing(false);
  }

  function startEdit() {
    if (query.isPending || saving || editing) return;
    setEditing(true);
  }

  async function saveEdit() {
    if (query.isPending || saving || !editing) return;

    const waterTotalValue = Number(normalizeWaterTotalDraft(draft));
    if (!waterTotalValue) return;

    const next = await persist(
      {
        waterTotal: waterTotalValue,
        waterIntake: Math.min(activeLog.waterIntake, waterTotalValue),
      },
      { showUpdatedToast: true },
    );

    if (next) setEditing(false);
  }

  function changeWaterTotal(value: string) {
    setDraft(value.replace(/[^\d.,]/g, ''));
  }

  return {
    data: {
      title: 'Water Intake',
      consumedLabel: formatLiters(activeLog.waterIntake),
      targetLabel: formatLiters(activeLog.waterTotal),
      glassCount,
      filledCount,
      editing,
      dirty,
      draft,
    },
    ui: {
      loading: query.isPending,
      saving,
      disabled: query.isPending || saving,
    },
    actions: {
      clickGlass,
      startEdit,
      saveEdit,
      cancelEdit,
      changeWaterTotal,
    },
  };
}
