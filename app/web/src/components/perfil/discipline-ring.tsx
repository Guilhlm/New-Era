export function DisciplineRing({
  percent,
  value,
  caption,
}: {
  percent: number;
  value: string;
  caption: string;
}) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const dash = c * (percent / 100);
  const gap = c - dash;

  return (
    <div className="relative h-40 w-40">
      <svg className="-rotate-90" viewBox="0 0 120 120" width="160" height="160" aria-hidden>
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--color-layer2)" strokeWidth="6" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="var(--color-red)"
          strokeWidth="6"
          strokeDasharray={`${dash} ${gap}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="type-stat-lg text-text">{value}</span>
        <span className="type-caption mt-1 text-red">{caption}</span>
      </div>
    </div>
  );
}
