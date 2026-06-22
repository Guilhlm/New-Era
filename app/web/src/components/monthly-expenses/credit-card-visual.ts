export function normalizeCardHex(color: string) {
  const normalized = color.trim().toLowerCase();
  return /^#[0-9a-f]{6}$/.test(normalized) ? normalized : '#820AD1';
}

function hexToRgb(hex: string) {
  const value = normalizeCardHex(hex).slice(1);
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
}

function shiftHex(hex: string, amount: number) {
  const { r, g, b } = hexToRgb(hex);
  const clamp = (value: number) => Math.min(255, Math.max(0, Math.round(value)));
  const toHex = (value: number) => clamp(value).toString(16).padStart(2, '0');
  return `#${toHex(r + amount)}${toHex(g + amount)}${toHex(b + amount)}`;
}

export function isLightCardColor(color: string) {
  const { r, g, b } = hexToRgb(color);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.68;
}

export function creditCardBackgroundStyle(color: string): import('react').CSSProperties {
  const base = normalizeCardHex(color);
  const light = isLightCardColor(base);
  const top = shiftHex(base, light ? 14 : 24);
  const accent = shiftHex(base, light ? -6 : 10);
  const bottom = shiftHex(base, light ? -18 : -34);

  return {
    backgroundColor: base,
    backgroundImage: light
      ? `
        linear-gradient(148deg, ${top} 0%, ${accent} 30%, ${base} 54%, ${bottom} 100%),
        radial-gradient(ellipse 72% 56% at 90% 10%, rgba(255,255,255,0.58) 0%, transparent 58%),
        radial-gradient(ellipse 48% 38% at 10% 90%, rgba(0,0,0,0.05) 0%, transparent 52%)
      `
      : `
        linear-gradient(148deg, ${top} 0%, ${accent} 28%, ${base} 52%, ${bottom} 100%),
        radial-gradient(ellipse 72% 56% at 90% 10%, rgba(255,255,255,0.18) 0%, transparent 58%),
        radial-gradient(ellipse 48% 38% at 10% 90%, rgba(0,0,0,0.24) 0%, transparent 52%)
      `,
  };
}

export function creditCardTextTone(color: string) {
  return isLightCardColor(color)
    ? {
        primary: 'text-slate-900',
        secondary: 'text-slate-800/75',
        muted: 'text-slate-700/60',
        ring: 'ring-black/[0.06]',
        arc: 'border-black/[0.06]',
        chipLine: 'from-amber-100 via-amber-300/90 to-amber-500/80',
        chipRing: 'ring-black/10',
        action: 'bg-white/70 text-slate-800 hover:bg-white/85',
      }
    : {
        primary: 'text-white',
        secondary: 'text-white/78',
        muted: 'text-white/58',
        ring: 'ring-white/10',
        arc: 'border-white/[0.08]',
        chipLine: 'from-amber-200/95 via-amber-400/85 to-amber-600/75',
        chipRing: 'ring-black/20',
        action: 'bg-white/12 text-white/90 hover:bg-white/18',
      };
}
