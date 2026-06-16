'use client';

import { useCallback, useEffect, useRef } from 'react';

export function getCalendarWeekday() {
  return new Date().getDay();
}

const CHECK_INTERVAL_MS = 30_000;

export function useCalendarDayChange(onDayChange: (weekday: number) => void) {
  const onDayChangeRef = useRef(onDayChange);
  onDayChangeRef.current = onDayChange;

  useEffect(() => {
    let currentWeekday = getCalendarWeekday();

    function check() {
      const nextWeekday = getCalendarWeekday();
      if (nextWeekday === currentWeekday) return;
      currentWeekday = nextWeekday;
      onDayChangeRef.current(nextWeekday);
    }

    const intervalId = window.setInterval(check, CHECK_INTERVAL_MS);
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') check();
    };

    window.addEventListener('focus', check);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', check);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);
}

export function useCalendarWeekday() {
  const weekdayRef = useRef(getCalendarWeekday());

  const syncWeekday = useCallback((nextWeekday: number) => {
    weekdayRef.current = nextWeekday;
  }, []);

  useCalendarDayChange(syncWeekday);

  return weekdayRef.current;
}
