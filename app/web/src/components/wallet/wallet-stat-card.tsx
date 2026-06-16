import { IoChevronDown, IoEyeOffOutline, IoEyeOutline } from 'react-icons/io5';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';
import type { WalletCurrency, WalletStatCardVm } from '@/types/wallet';
import { formatWalletAmount } from '@/utils/wallet';

type WalletStatCardProps = {
  data: WalletStatCardVm;
  ui?: {
    currency?: WalletCurrency;
    fxRate?: number;
    hidden?: boolean;
  };
  actions?: {
    onToggleHidden?: () => void;
    onDeposit?: () => void;
    onCurrencyChange?: (currency: WalletCurrency) => void;
  };
  className?: string;
  style?: React.CSSProperties;
};

function toneClass(tone?: 'positive' | 'negative' | 'neutral') {
  if (tone === 'positive') return 'text-green';
  if (tone === 'negative') return 'text-red';
  return 'text-text';
}

function FooterMetric({
  metric,
  align = 'left',
}: {
  metric: Extract<WalletStatCardVm['footerLeft'], { kind: 'metric' }>;
  align?: 'left' | 'right';
}) {
  return (
    <div className={cn('min-w-0', align === 'right' && 'text-right')}>
      <p className={cn('truncate', typeClass.caption)}>{metric.label}</p>
      <p className={cn('mt-0.5 truncate tabular-nums', typeClass.bodyStrong, toneClass(metric.tone))}>
        {metric.value}
      </p>
    </div>
  );
}

export function WalletStatCard({ data, ui, actions, className, style }: WalletStatCardProps) {
  const hidden = Boolean(ui?.hidden && data.showEye);
  const amountOpts = { currency: ui?.currency, fxRate: ui?.fxRate };
  const amountLabel = hidden ? '••••••••' : formatWalletAmount(data.amount, amountOpts);
  const displayAmount =
    hidden || data.amountTone !== 'positive'
      ? amountLabel
      : formatWalletAmount(data.amount, { ...amountOpts, signed: true });

  return (
    <Card
      className={cn('flex h-full min-h-[168px] flex-col px-4 py-4 lg:px-5 lg:py-5', className)}
      style={style}
    >
      <div className="flex min-h-8 shrink-0 items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <h3 className={cn('truncate', typeClass.bodyStrong, 'text-text/80')}>{data.title}</h3>
          <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center">
            {data.showEye ? (
              <button
                type="button"
                className="inline-flex text-text/55 transition hover:text-text"
                aria-label={hidden ? 'Show balance' : 'Hide balance'}
                onClick={actions?.onToggleHidden}
              >
                {hidden ? (
                  <IoEyeOffOutline className="h-4 w-4" aria-hidden />
                ) : (
                  <IoEyeOutline className="h-4 w-4" aria-hidden />
                )}
              </button>
            ) : null}
          </span>
        </div>

        <button
          type="button"
          className={cn('inline-flex h-7 shrink-0 items-center gap-1 rounded-md bg-layer2 px-2 transition hover:bg-layer2-half hover:text-text', typeClass.micro, 'text-text/70')}
          aria-label="Currency"
          onClick={() =>
            actions?.onCurrencyChange?.(ui?.currency === 'BRL' ? 'USDT' : 'BRL')
          }
        >
          {ui?.currency ?? 'USDT'}
          <IoChevronDown className="h-3 w-3" aria-hidden />
        </button>
      </div>

      <div className="mt-3 flex min-h-[2.5rem] shrink-0 items-end">
        <p
          className={cn(
            'w-full truncate',
            typeClass.title,
            data.amountTone === 'positive'
              ? 'text-green'
              : data.amountTone === 'negative'
                ? 'text-red'
                : 'text-text',
          )}
          title={hidden ? undefined : displayAmount}
        >
          {displayAmount}
        </p>
      </div>

      <div className="mt-auto grid min-h-[3rem] grid-cols-2 items-end gap-3 pt-4">
        <FooterMetric metric={data.footerLeft} align="left" />
        {data.footerRight.kind === 'action' ? (
          <div className="flex items-end justify-end">
            <Button
              type="button"
              variant="primary"
              size="sm"
              radius="md"
              className={cn('h-9 whitespace-nowrap px-3', typeClass.micro)}
              onClick={actions?.onDeposit}
            >
              {data.footerRight.label}
            </Button>
          </div>
        ) : (
          <FooterMetric metric={data.footerRight} align="right" />
        )}
      </div>
    </Card>
  );
}
