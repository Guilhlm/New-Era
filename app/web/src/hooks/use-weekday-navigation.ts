'use client';

import { useCallback, useState } from 'react';
import { getCalendarWeekday, useCalendarDayChange } from '@/hooks/use-calendar-day-change';

/**
 * Shared weekday selection used by the diet/task/workout day views.
 * Starts on today's weekday and follows calendar day changes (midnight).
 */
export function useWeekdayNavigation() {
  const [selectedWeekday, setSelectedWeekday] = useState(getCalendarWeekday);

  useCalendarDayChange(
    useCallback((weekdayIndex) => {
      setSelectedWeekday(weekdayIndex);
    }, []),
  );

  const prevDay = useCallback(() => {
    setSelectedWeekday((day) => (day === 0 ? 6 : day - 1));
  }, []);

  const nextDay = useCallback(() => {
    setSelectedWeekday((day) => (day === 6 ? 0 : day + 1));
  }, []);

  const selectWeekday = useCallback((weekdayIndex: number) => {
    setSelectedWeekday(weekdayIndex);
  }, []);

  return { selectedWeekday, prevDay, nextDay, selectWeekday };
}
