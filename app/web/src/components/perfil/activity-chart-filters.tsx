import { SegmentedControl, SegmentedControlItem } from '@/components/ui/segmented-control';

type ChartTab = 'training' | 'financial';
type ChartPeriod = 7 | 14 | 30;

type ActivityChartFiltersProps = {
  chartTab: ChartTab;
  onChartTabChange: (tab: ChartTab) => void;
  period: ChartPeriod;
  onPeriodChange: (period: ChartPeriod) => void;
};

export function ActivityChartFilters({
  chartTab,
  onChartTabChange,
  period,
  onPeriodChange,
}: ActivityChartFiltersProps) {
  return (
    <div className="flex w-full items-center justify-between gap-3 pt-8">
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

