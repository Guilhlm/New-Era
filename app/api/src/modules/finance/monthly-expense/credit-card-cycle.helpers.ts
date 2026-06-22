export function monthKeyFromDate(value: Date) {
  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function clampDueDay(value?: number | null) {
  const day = Number(value ?? 10);
  if (!Number.isFinite(day)) return 10;
  return Math.min(28, Math.max(1, Math.trunc(day)));
}

/** Fechamento do ciclo: vencimento + 21 dias, limitado ao dia 28. */
export function closingDayFromDueDay(dueDay: number) {
  return Math.min(28, clampDueDay(dueDay) + 21);
}

export function addUtcMonths(value: Date, months: number) {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth() + months, 1));
}

export type CreditCardCycle = {
  monthKey: string;
  dueDate: Date;
  closingDate: Date;
};

/**
 * Resolve o ciclo de fatura para uma data de compra.
 * Compras antes do dia de fechamento entram na fatura que fecha no mês corrente;
 * a partir do fechamento (inclusive), entram na fatura do próximo ciclo.
 */
export function resolveCreditCardCycle(
  purchaseDate: Date,
  dueDay: number,
  cycleOffsetMonths = 0,
): CreditCardCycle {
  const closingDay = closingDayFromDueDay(dueDay);
  const dueDayClamped = clampDueDay(dueDay);

  let anchor = new Date(
    Date.UTC(purchaseDate.getUTCFullYear(), purchaseDate.getUTCMonth(), 1),
  );
  if (purchaseDate.getUTCDate() >= closingDay) {
    anchor = addUtcMonths(anchor, 1);
  }
  anchor = addUtcMonths(anchor, cycleOffsetMonths);

  const closingDate = new Date(
    Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), closingDay),
  );
  const dueAnchor = addUtcMonths(anchor, 1);
  const dueDate = new Date(
    Date.UTC(dueAnchor.getUTCFullYear(), dueAnchor.getUTCMonth(), dueDayClamped),
  );

  return {
    monthKey: monthKeyFromDate(dueDate),
    dueDate,
    closingDate,
  };
}

export function invoiceBalance(amount: unknown, paidAmount: unknown) {
  return Math.max(0, Number(amount ?? 0) - Number(paidAmount ?? 0));
}

export function isInvoiceCycleOpen(status: string, closingDate: Date, now = new Date()) {
  if (status !== 'open') return false;
  return now.getTime() < endOfUtcDay(closingDate).getTime();
}

export function endOfUtcDay(value: Date) {
  return new Date(
    Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate(), 23, 59, 59, 999),
  );
}

/** Deriva a data de fechamento a partir do vencimento (para backfill/migração). */
export function closingDateFromDueDate(dueDate: Date, dueDay: number) {
  const closingDay = closingDayFromDueDay(dueDay);
  const monthBeforeDue = addUtcMonths(
    new Date(Date.UTC(dueDate.getUTCFullYear(), dueDate.getUTCMonth(), 1)),
    -1,
  );
  return new Date(
    Date.UTC(monthBeforeDue.getUTCFullYear(), monthBeforeDue.getUTCMonth(), closingDay),
  );
}
