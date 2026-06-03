import { SegmentedControl, SegmentedControlItem } from '@/components/ui/segmented-control';
import type { ReactNode } from 'react';

type ChartTab = 'training' | 'financial';
type ChartPeriod = 7 | 14 | 30;

type ActivityChartFiltersProps = {
  chartTab: ChartTab;
  onChartTabChange: (tab: ChartTab) => void;
  period: ChartPeriod;
  onPeriodChange: (period: ChartPeriod) => void;
  showTab?: boolean;
  leftSlot?: ReactNode;
};

export function ActivityChartFilters({
  chartTab,
  onChartTabChange,
  period,
  onPeriodChange,
  showTab = true,
  leftSlot,
}: ActivityChartFiltersProps) {
  return (
    <div className="flex w-full items-center justify-between gap-3 pt-8">
      {leftSlot ? (
        <div className="flex h-10 flex-1 items-center pl-4 text-sm font-semibold text-text">
          {leftSlot}
        </div>
      ) : showTab ? (
        <SegmentedControl variant="soft" className="h-10 flex-1 max-w-[260px]">
          <SegmentedControlItem
            className="flex-1 text-center"
            onClick={() => onChartTabChange('training')}
            active={chartTab === 'training'}
          >
            Training
          </SegmentedControlItem>
          <SegmentedControlItem
            className="flex-1 text-center"
            onClick={() => onChartTabChange('financial')}
            active={chartTab === 'financial'}
          >
            Financial
          </SegmentedControlItem>
        </SegmentedControl>
      ) : (
        <div className="flex-1" />
      )}

      <SegmentedControl variant="soft" className="h-10 flex-1 max-w-[260px]">
        {([7, 14, 30] as const).map((d) => (
          <SegmentedControlItem
            key={d}
            className="flex-1 text-center"
            onClick={() => onPeriodChange(d)}
            active={period === d}
          >
            {d} days
          </SegmentedControlItem>
        ))}
      </SegmentedControl>
    </div>
  );
}

