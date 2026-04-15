'use client';

import { useMemo, useState } from 'react';
import type { ChartTab, Period } from '@/types/profile';
import { barHeights } from '@/utils/profile';

export function useProfileChart() {
  const [chartTab, setChartTab] = useState<ChartTab>('training');
  const [period, setPeriod] = useState<Period>(7);
  const heights = useMemo(() => barHeights(chartTab, period), [chartTab, period]);

  return {
    chartTab,
    setChartTab,
    period,
    setPeriod,
    heights,
  };
}

export type ProfileChartState = ReturnType<typeof useProfileChart>;
