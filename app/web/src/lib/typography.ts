export const typeClass = {
  display: 'type-display',
  page: 'type-page',
  title: 'type-title',
  statLg: 'type-stat-lg',
  stat: 'type-stat',
  body: 'type-body',
  bodyStrong: 'type-body-strong',
  label: 'type-label',
  caption: 'type-caption',
  overline: 'type-overline',
  micro: 'type-micro',
  hero: 'type-hero',
} as const;

export const typeToneClass = {
  default: 'text-text',
  muted: 'text-text/55',
  muted60: 'text-text-60',
  accent: 'text-red',
  positive: 'text-green',
  negative: 'text-red',
  onAccent: 'text-on-accent',
} as const;

export type TypeClass = (typeof typeClass)[keyof typeof typeClass];
export type TypeToneClass = (typeof typeToneClass)[keyof typeof typeToneClass];
