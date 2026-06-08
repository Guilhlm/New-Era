export function clampPercent(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function toDraftString(value: unknown) {
  if (value === null || value === undefined) return '';
  return String(value);
}

export function normalizeWeightDraft(value: string) {
  const cleaned = value.replace(',', '.').replace(/[^\d.]/g, '');
  if (!cleaned) return '';

  const hasDot = cleaned.includes('.');
  if (!hasDot) {
    const digits = cleaned.replace(/\D/g, '');
    const intPart = digits.slice(0, 3);
    const decPart = digits.slice(3, 5);
    return decPart ? `${intPart}.${decPart}` : intPart;
  }

  const [rawInt, ...rest] = cleaned.split('.');
  const intPart = (rawInt ?? '').replace(/\D/g, '').slice(0, 3);
  const decPart = rest.join('').replace(/\D/g, '').slice(0, 2);
  return decPart.length ? `${intPart}.${decPart}` : `${intPart}.`;
}

export function normalizeInt3Draft(value: string) {
  return value.replace(/\D/g, '').slice(0, 3);
}
