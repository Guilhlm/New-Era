'use client';

import { useCallback, useEffect, useState } from 'react';
import { toastAuthError } from '@/lib/app-toast';
import { getDietDay } from '@/services/diet';
import { HttpError } from '@/services/http';
import type { DietMealVm } from '@/types/diet';
import { DIET_WEEKDAYS } from '@/utils/diet-constants';

export function useDietDayQuery(initialWeekday = 1) {
  const [selectedWeekday, setSelectedWeekday] = useState(initialWeekday);
  const [meals, setMeals] = useState<DietMealVm[]>([]);
  const [loading, setLoading] = useState(false);

  const weekday = DIET_WEEKDAYS.find((day) => day.index === selectedWeekday);

  const loadDay = useCallback(async (weekdayIndex: number) => {
    setLoading(true);
    try {
      const { meals: nextMeals } = await getDietDay(weekdayIndex);
      setMeals(nextMeals.map((meal) => ({ ...meal, expanded: false, draft: null })));
    } catch (error) {
      const message = error instanceof HttpError ? error.message : 'Could not load diet day.';
      toastAuthError(message);
      setMeals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDay(selectedWeekday);
  }, [loadDay, selectedWeekday]);

  function prevDay() {
    setSelectedWeekday((day) => (day === 0 ? 6 : day - 1));
  }

  function nextDay() {
    setSelectedWeekday((day) => (day === 6 ? 0 : day + 1));
  }

  return {
    data: {
      selectedWeekday,
      weekdayLabel: weekday?.label ?? 'Monday',
      weekdayShortLabel: weekday?.shortLabel ?? 'Mon',
      meals,
    },
    actions: {
      setMeals,
      loadDay,
      prevDay,
      nextDay,
    },
    ui: {
      loading,
    },
  };
}
