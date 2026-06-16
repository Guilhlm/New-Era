import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';
import type { WalletCurrency, WalletTransactionVm } from '@/types/wallet';
import { formatWalletAmount } from '@/utils/wallet';

type WalletRecentTransactionsCardProps = {
  data: {
    title: string;
    transactions: WalletTransactionVm[];
  };
  ui?: {
    loading?: boolean;
    currency?: WalletCurrency;
    fxRate?: number;
  };
  className?: string;
  style?: React.CSSProperties;
};

function TransactionIcon({ title }: { title: string }) {
  const label =
    title
      .replace(/^(Buy|Sell|Dividend|Position registered|Deposit|Withdraw)\s+/i, '')
      .slice(0, 2)
      .toUpperCase() || 'TX';

  return (
    <span
      className={cn(
        'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-layer2',
        typeClass.micro,
        typeClass.bodyStrong,
        typeToneClass.default,
      )}
    >
      {label}
    </span>
  );
}

export function WalletRecentTransactionsCard({
  data,
  ui,
  className,
  style,
}: WalletRecentTransactionsCardProps) {
  return (
    <Card
      className={cn(
        'flex h-full min-h-0 flex-col gap-12 overflow-hidden px-6 py-5 lg:px-7 lg:py-6',
        className,
      )}
      style={style}
    >
      <div className="flex shrink-0 items-center justify-center min-h-8">
        <h2 className={cn('min-w-0 truncate text-center', typeClass.title)}>{data.title}</h2>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {ui?.loading ? (
          <div className={cn('flex h-full items-center justify-center', typeClass.body, typeToneClass.muted60)}>
            Loading transactions…
          </div>
        ) : (
          <table className={cn('w-full table-fixed border-collapse [&_td]:align-middle [&_th]:align-middle', typeClass.caption)}>
            <colgroup>
              <col />
              <col className="w-[6.75rem]" />
            </colgroup>
            <thead>
              <tr className="border-b border-grey text-text/55">
                <th className={cn('pb-3 pr-2 pt-1 text-left', typeClass.label)}>Transaction</th>
                <th className={cn('pb-3 pl-2 pt-1 text-right', typeClass.label)}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.transactions.map((transaction) => {
                const positive = transaction.amount >= 0;

                return (
                  <tr key={transaction.id} className="border-b border-grey/60">
                    <td className="py-3 pr-2">
                      <div className="flex items-center gap-2">
                        <TransactionIcon title={transaction.title} />
                        <div className="min-w-0">
                          <p className={cn('truncate', typeClass.bodyStrong, typeToneClass.default)}>{transaction.title}</p>
                          <p className={cn('truncate', typeClass.micro, typeToneClass.muted)}>{transaction.subtitle}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pl-2">
                      <div className="flex items-center justify-end">
                        <p
                          className={cn(
                            'truncate tabular-nums',
                            typeClass.label,
                            positive ? typeToneClass.positive : typeToneClass.negative,
                          )}
                        >
                          {formatWalletAmount(transaction.amount, {
                            signed: true,
                            currency: ui?.currency,
                            fxRate: ui?.fxRate,
                          })}
                        </p>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
}
