import { RiLayoutGridLine } from 'react-icons/ri';
import { Card } from '@/components/ui/card';
import { formatUsd } from '@/utils/profile';

const WALLET_SEGMENTS = [
  { key: 'btc', label: 'BTC', pct: 55, className: 'bg-red' },
  { key: 'usd', label: 'Dolar', pct: 30, className: 'bg-wallet-usd' },
  { key: 'selic', label: 'Selic', pct: 15, className: 'bg-wallet-selic' },
] as const;

type WalletCardProps = {
  balanceUsd: number;
};

export function WalletCard({ balanceUsd }: WalletCardProps) {
  return (
    <Card
      className="flex flex-col justify-between px-6 py-6 lg:px-7 lg:py-7"
      style={{ gridColumn: '3 / 5', gridRow: '1 / 2' }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-text">
          <RiLayoutGridLine className="h-4 w-4 shrink-0 text-red" aria-hidden />
          <h2 className="text-sm font-normal leading-tight text-red">Investments Wallet</h2>
        </div>
        <p className="flex items-center gap-[5px] text-xs text-text/55">
          <span>Last update</span>
          <span className="font-semibold text-green">+ $ 0,00</span>
        </p>
      </div>
      <p className="mt-3.5 text-2xl font-semibold tracking-tight text-text md:text-3xl">
        {formatUsd(balanceUsd || 0.00)}
      </p>
      <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-layer2">
        {WALLET_SEGMENTS.map((s) => (
          <div key={s.key} className={s.className} style={{ width: `${s.pct}%` }} title={s.label} />
        ))}
      </div>
      <ul className="mt-3 flex flex-wrap gap-3.5 text-xs text-text">
        {WALLET_SEGMENTS.map((s) => (
          <li key={s.key} className="flex items-center gap-2">
            <span className={`h-2 w-2 shrink-0 rounded-full ${s.className}`} aria-hidden />
            {s.label}
          </li>
        ))}
      </ul>
    </Card>
  );
}
