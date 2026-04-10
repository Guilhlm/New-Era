type DashboardCardProps = {
  title: string;
  value: string;
  subtitle?: string;
};

export function DashboardCard({ title, value, subtitle }: DashboardCardProps) {
  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</h3>
      <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{value}</p>
      {subtitle ? <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</p> : null}
    </article>
  );
}
