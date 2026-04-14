import { Card } from '@/components/ui/card';
import { SegmentedControl, SegmentedControlItem } from '@/components/ui/segmented-control';
import type { ChartTab, Period } from '@/types/profile';

const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'] as const;

type ActivityChartCardProps = {
  chartTab: ChartTab;
  setChartTab: (tab: ChartTab) => void;
  period: Period;
  setPeriod: (period: Period) => void;
  heights: number[];
};

export function ActivityChartCard({
  chartTab,
  setChartTab,
  period,
  setPeriod,
  heights,
}: ActivityChartCardProps) {
  return (
    <Card
      className="flex min-h-64 flex-col px-6 py-5 lg:min-h-0 lg:px-7 lg:py-6"
      style={{ gridColumn: '3 / 6', gridRow: '2 / 3' }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl variant="soft">
          <SegmentedControlItem onClick={() => setChartTab('training')} active={chartTab === 'training'}>
            Training
          </SegmentedControlItem>
          <SegmentedControlItem onClick={() => setChartTab('financial')} active={chartTab === 'financial'}>
            Financial
          </SegmentedControlItem>
        </SegmentedControl>
        <SegmentedControl variant="pill">
          {([7, 14, 30] as const).map((d) => (
            <SegmentedControlItem key={d} onClick={() => setPeriod(d)} active={period === d} shape="full">
              {d} dias
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
      </div>
      <div className="mt-6 flex h-56 w-full gap-1.5 border-b border-grey/50 pb-2 sm:gap-2">
        {heights.map((h, i) => {
          const barH = Math.max(28, Math.round((h / 100) * 200));
          const isShort = h < 55;
          const fill = chartTab === 'training' ? (isShort ? 'bg-layer2' : 'bg-red') : isShort ? 'bg-layer2' : 'bg-red';
          return (
            <div key={`${chartTab}-${period}-${i}`} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
              <div
                className={`w-full max-w-11 rounded-t-md ${fill}`}
                style={{ height: barH }}
                title={`${WEEKDAYS[i]}: ${Math.round(h)}%`}
              />
              <span className="text-xs text-text/55">{WEEKDAYS[i]}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
