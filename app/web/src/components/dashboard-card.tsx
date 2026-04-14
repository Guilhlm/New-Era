import { Card } from '@/components/ui/card';

type DashboardCardProps = {
  title: string;
  value: string;
  subtitle?: string;
};

export function DashboardCard({ title, value, subtitle }: DashboardCardProps) {
  return (
    <Card as="article" variant="border" padding="sm" className="bg-layer2 shadow-sm">
      <h3 className="text-sm font-medium text-text/60">{title}</h3>
      <p className="mt-2 text-2xl font-semibold text-text">{value}</p>
      {subtitle ? <p className="mt-1 text-xs text-text/55">{subtitle}</p> : null}
    </Card>
  );
}
