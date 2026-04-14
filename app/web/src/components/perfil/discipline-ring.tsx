export function DisciplineRing({ percent, label }: { percent: number; label: string }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const dash = c * (percent / 100);
  const gap = c - dash;

  return (
    <div className="relative h-36 w-36">
      <svg className="-rotate-90" viewBox="0 0 120 120" width="140" height="140" aria-hidden>
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--color-layer2)" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="var(--color-red)"
          strokeWidth="10"
          strokeDasharray={`${dash} ${gap}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold text-text">{label}</span>
      </div>
    </div>
  );
}
