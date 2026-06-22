import { cn } from '@/components/ui/cn';
import { isLightCardColor } from '@/components/monthly-expenses/credit-card-visual';

type CreditCardDecorProps = {
  color: string;
  light?: boolean;
  compact?: boolean;
};

export function CreditCardDecor({ color, light: lightProp, compact = false }: CreditCardDecorProps) {
  const light = lightProp ?? isLightCardColor(color);
  const gridColor = light ? 'rgba(0,0,0,0.045)' : 'rgba(255,255,255,0.055)';
  const arc = light ? 'border-black/[0.07]' : 'border-white/[0.1]';
  const arcSoft = light ? 'border-black/[0.04]' : 'border-white/[0.05]';

  return (
    <>
      <div
        className={cn(
          'pointer-events-none absolute rounded-full blur-2xl',
          compact ? '-right-5 -top-5 h-16 w-16' : '-right-8 -top-8 h-32 w-32',
        )}
        style={{ background: light ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.1)' }}
        aria-hidden
      />

      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage: `
            repeating-linear-gradient(90deg, ${gridColor} 0 1px, transparent 1px ${compact ? '10px' : '14px'}),
            repeating-linear-gradient(0deg, ${gridColor} 0 1px, transparent 1px ${compact ? '10px' : '14px'})
          `,
          maskImage: 'radial-gradient(ellipse 88% 78% at 70% 26%, black 12%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse 88% 78% at 70% 26%, black 12%, transparent 70%)',
        }}
        aria-hidden
      />

      <div
        className={cn(
          'pointer-events-none absolute rounded-full border',
          arc,
          compact ? '-right-6 top-2 h-20 w-20' : '-right-12 top-4 h-40 w-40',
        )}
        aria-hidden
      />
      <div
        className={cn(
          'pointer-events-none absolute rounded-full border',
          arcSoft,
          compact ? '-right-2 top-5 h-14 w-14' : '-right-4 top-12 h-28 w-28',
        )}
        aria-hidden
      />
      {!compact ? (
        <div
          className={cn('pointer-events-none absolute -right-20 top-0 h-52 w-52 rounded-full border', arcSoft)}
          aria-hidden
        />
      ) : null}

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `linear-gradient(128deg, transparent 36%, ${light ? 'rgba(255,255,255,0.38)' : 'rgba(255,255,255,0.09)'} 49.6%, ${light ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.05)'} 50.4%, transparent 64%)`,
        }}
        aria-hidden
      />

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: light
            ? 'linear-gradient(to top, rgba(0,0,0,0.07) 0%, transparent 44%)'
            : 'linear-gradient(to top, rgba(0,0,0,0.32) 0%, transparent 50%)',
        }}
        aria-hidden
      />

      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{
          boxShadow: light
            ? 'inset 0 1px 0 rgba(255,255,255,0.55)'
            : 'inset 0 1px 0 rgba(255,255,255,0.14)',
        }}
        aria-hidden
      />

      <span
        className={cn(
          'pointer-events-none absolute font-bold uppercase',
          compact
            ? 'bottom-2 right-2.5 text-[0.4rem] tracking-[0.28em] opacity-[0.09]'
            : 'bottom-3.5 right-4 text-[0.5rem] tracking-[0.38em] opacity-[0.08]',
          light ? 'text-slate-900' : 'text-white',
        )}
        aria-hidden
      >
        NEW ERA
      </span>
    </>
  );
}
