'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toastAuthError, toastUpdated } from '@/lib/app-toast';
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
  const date = useMemo(() => weekdayToDateString(selectedWeekday), [selectedWeekday]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [log, setLog] = useState<WaterLogVm | null>(null);
  const [savedDraft, setSavedDraft] = useState('3');
  const [draft, setDraft] = useState('3');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const next = await getWaterLogDay(date);
      setLog(next);
      const nextDraft = draftFromLog(next);
      setSavedDraft(nextDraft);
      setDraft(nextDraft);
    } catch (error) {
      toastAuthError(error instanceof HttpError ? error.message : 'Could not load water intake.');
      setLog(null);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    void load();
  }, [load]);

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

  async function persist(
    patch: { waterTotal?: number; waterIntake?: number },
    options?: { showUpdatedToast?: boolean },
  ) {
    setSaving(true);
    try {
      const next = await upsertWaterLogDay({ date, ...patch });
      setLog(next);
      const nextDraft = draftFromLog(next);
      setSavedDraft(nextDraft);
      setDraft(nextDraft);
      if (options?.showUpdatedToast) {
        toastUpdated(CRUD_TOAST.waterIntakeUpdated);
      }
      return next;
    } catch (error) {
      toastAuthError(error instanceof HttpError ? error.message : 'Could not save water intake.');
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function clickGlass(index: number) {
    if (editing || saving || loading) return;

    const isFilled = index < filledCount;
    const isNextEmpty = index === filledCount;

    if (isNextEmpty) {
      const nextIntake = Math.min(
        activeLog.waterTotal,
        Number((activeLog.waterIntake + perGlass).toFixed(2)),
      );
      if (nextIntake <= activeLog.waterIntake) return;
      await persist({ waterIntake: nextIntake });
      return;
    }

    if (!isFilled) return;

    const nextIntake = Math.max(0, Number((index * perGlass).toFixed(2)));
    if (nextIntake >= activeLog.waterIntake) return;
    await persist({ waterIntake: nextIntake });
  }

  function cancelEdit() {
    if (loading || saving) return;
    setDraft(savedDraft);
    setEditing(false);
  }

  function startEdit() {
    if (loading || saving || editing) return;
    setEditing(true);
  }

  async function saveEdit() {
    if (loading || saving || !editing) return;

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
      loading,
      saving,
      disabled: loading || saving,
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
