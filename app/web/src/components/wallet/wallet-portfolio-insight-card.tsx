import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';
import type { WalletPortfolioInsightVm } from '@/types/wallet';
import { formatWalletPercent } from '@/utils/wallet';

type WalletPortfolioInsightCardProps = {
  data: WalletPortfolioInsightVm;
  className?: string;
  style?: React.CSSProperties;
};

function InsightMetric({
  value,
  label,
  tone = 'neutral',
}: {
  value: string;
  label: string;
  tone?: 'positive' | 'negative' | 'neutral';
}) {
  return (
    <div className="min-w-0 rounded-lg bg-layer2-half px-3 py-2.5">
      <p className={cn('truncate', typeClass.caption)}>{label}</p>
      <p
        className={cn(
          'mt-0.5 truncate tabular-nums',
          typeClass.bodyStrong,
          tone === 'positive' ? typeToneClass.positive : tone === 'negative' ? typeToneClass.negative : typeToneClass.default,
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function WalletPortfolioInsightCard({ data, className, style }: WalletPortfolioInsightCardProps) {
  return (
    <Card
      className={cn('flex h-full min-h-[168px] flex-col px-4 py-4 lg:px-5 lg:py-5', className)}
      style={style}
    >
      <div className="flex shrink-0 items-start justify-between gap-3">
        <h3 className={cn('min-w-0 truncate', typeClass.bodyStrong, 'text-text/80')}>Portfolio Positions</h3>

        <p className={cn('shrink-0 truncate tabular-nums', typeClass.body, typeToneClass.default)}>
          <span className={typeClass.bodyStrong}>{data.positionsCount}</span>{' '}
          <span className={typeToneClass.muted60}>active holdings</span>
        </p>
      </div>

      <div className="mt-auto flex flex-col gap-2 pt-4">
        <div className="grid grid-cols-2 gap-2">
          <InsightMetric value={String(data.winnersCount)} label="Winners" tone="positive" />
          <InsightMetric
            value={String(data.losersCount)}
            label="Losers"
            tone={data.losersCount > 0 ? 'negative' : 'neutral'}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <InsightMetric
            value={formatWalletPercent(data.best.gainPct, { signed: true })}
            label={`Best · ${data.best.ticker}`}
            tone={data.best.gainPct >= 0 ? 'positive' : 'negative'}
          />
          <InsightMetric
            value={formatWalletPercent(data.worst.gainPct, { signed: true })}
            label={`Worst · ${data.worst.ticker}`}
            tone={data.worst.gainPct >= 0 ? 'positive' : 'negative'}
          />
        </div>
      </div>
    </Card>
  );
}
