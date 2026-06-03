/** Lado do input de circunferência. `single` cobre medidas únicas; `left`/`right` os bilaterais. */
export type MeasurementInputSide = 'single' | 'left' | 'right';

/**
 * Texto exibido em um input de circunferência **já salvo** (sem alteração) quando ele não está focado.
 * Retorna string vazia quando o valor é vazio para preservar o placeholder do input.
 */
export function formatSavedMeasurementInputDisplay(raw: string, side: MeasurementInputSide): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (side === 'left') return `Left   ${trimmed} cm`;
  if (side === 'right') return `Right   ${trimmed} cm`;
  return `${trimmed} cm`;
}
