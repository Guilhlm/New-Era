const MONTH_LOCALE = 'pt-BR';

/** `YYYY-MM` from a calendar date (local timezone). */
export function monthKeyFromDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/** Current month as `YYYY-MM`. */
export function currentMonthKey() {
  return monthKeyFromDate(new Date());
}

export function formatMonthLabel(date: Date) {
  return date.toLocaleDateString(MONTH_LOCALE, {
    month: 'long',
    year: 'numeric',
  });
}

export function formatMonthShort(date: Date) {
  return date
    .toLocaleDateString(MONTH_LOCALE, { month: 'short' })
    .replace('.', '')
    .replace(/^\w/, (c) => c.toUpperCase());
}

export function formatShortDate(dateIso: string) {
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) return dateIso;
  return date.toLocaleDateString(MONTH_LOCALE, { day: '2-digit', month: '2-digit' });
}
