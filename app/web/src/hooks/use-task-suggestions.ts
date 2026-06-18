'use client';

import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toastAuthError } from '@/lib/app-toast';
import { queryKeys } from '@/lib/query-keys';
import { getTaskSuggestions } from '@/services/task';
import { HttpError } from '@/services/http';
import type { TaskSuggestionVm } from '@/types/task';
import { normalizeTimeInputValue } from '@/utils/task-mapper';

type SuggestionRow = TaskSuggestionVm & { selected: boolean; scheduledAt: string };

function mapSuggestions(items: TaskSuggestionVm[]): SuggestionRow[] {
  return items.map((item) => {
    const defaultScheduledAt = normalizeTimeInputValue(item.defaultScheduledAt);
    return {
      ...item,
      defaultScheduledAt,
      selected: false,
      scheduledAt: defaultScheduledAt,
    };
  });
}

export function useTaskSuggestions(selectedWeekday: number) {
  const [localOverrides, setLocalOverrides] = useState<Record<string, Partial<SuggestionRow>>>({});

  const query = useQuery({
    queryKey: queryKeys.taskSuggestions(selectedWeekday),
    queryFn: async () => {
      const { suggestions } = await getTaskSuggestions(selectedWeekday);
      return mapSuggestions(suggestions);
    },
    retry: 3,
  });

  useEffect(() => {
    setLocalOverrides({});
  }, [selectedWeekday]);

  useEffect(() => {
    if (!query.isError) return;
    const message =
      query.error instanceof HttpError ? query.error.message : 'Could not load suggestions.';
    toastAuthError(message);
  }, [query.isError, query.error]);

  const suggestions = useMemo(() => {
    const base = query.data ?? [];
    return base.map((item) => ({
      ...item,
      ...localOverrides[item.sourceId],
    }));
  }, [query.data, localOverrides]);

  const loadSuggestions = useCallback(
    async (_weekday: number) => {
      setLocalOverrides({});
      await query.refetch();
    },
    [query],
  );

  function toggleSuggestion(sourceId: string) {
    setLocalOverrides((prev) => {
      const base = query.data?.find((item) => item.sourceId === sourceId);
      const merged = { ...base, ...prev[sourceId] };
      const currentlySelected = merged?.selected ?? false;
      return {
        ...prev,
        [sourceId]: { ...prev[sourceId], selected: !currentlySelected },
      };
    });
  }

  function setSuggestionTime(sourceId: string, scheduledAt: string) {
    setLocalOverrides((prev) => ({
      ...prev,
      [sourceId]: { ...prev[sourceId], scheduledAt },
    }));
  }

  function setSuggestions(updater: SuggestionRow[] | ((prev: SuggestionRow[]) => SuggestionRow[])) {
    const next = typeof updater === 'function' ? updater(suggestions) : updater;
    const overrides: Record<string, Partial<SuggestionRow>> = {};
    for (const item of next) {
      overrides[item.sourceId] = { selected: item.selected, scheduledAt: item.scheduledAt };
    }
    setLocalOverrides(overrides);
  }

  return {
    data: { suggestions },
    actions: {
      loadSuggestions,
      toggleSuggestion,
      setSuggestionTime,
      setSuggestions,
    },
    ui: { loading: query.isPending && query.data === undefined },
  };
}
