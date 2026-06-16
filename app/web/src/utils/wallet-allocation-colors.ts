/** Paleta fixa de 4 cores — top 3 posições + restante agregado. */
export const ALLOCATION_SEGMENT_COLORS = [
  'var(--color-red)',
  '#3b82f6',
  '#a855f7',
  '#eab308',
] as const;

export function getAllocationColorByIndex(index: number): string {
  if (index < 0) return ALLOCATION_SEGMENT_COLORS[3];
  return ALLOCATION_SEGMENT_COLORS[Math.min(index, 3)] ?? ALLOCATION_SEGMENT_COLORS[3];
}

export function colorizeAllocationSegments<T extends { key: string; label: string }>(
  segments: T[],
): Array<T & { color: string }> {
  return segments.slice(0, 4).map((segment, index) => ({
    ...segment,
    color: getAllocationColorByIndex(index),
  }));
}

/** @deprecated Use colorizeAllocationSegments — mantido para compatibilidade pontual. */
export function getAllocationColorForKey(key: string): string {
  if (key === 'others') return ALLOCATION_SEGMENT_COLORS[3];
  if (key === 'wallet') return 'var(--color-wallet-selic)';
  return ALLOCATION_SEGMENT_COLORS[0];
}

/** @deprecated Use colorizeAllocationSegments. */
export function applyAllocationColors<T extends { key: string; color: string }>(
  segments: T[],
): T[] {
  return segments.slice(0, 4).map((segment, index) => ({
    ...segment,
    color: getAllocationColorByIndex(index),
  }));
}
