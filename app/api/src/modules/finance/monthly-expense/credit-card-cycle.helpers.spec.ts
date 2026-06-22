import {
  closingDateFromDueDate,
  invoiceBalance,
  isInvoiceCycleOpen,
  resolveCreditCardCycle,
} from './credit-card-cycle.helpers';

describe('credit-card-cycle.helpers', () => {
  it('maps due day 7 purchases before closing to the current cycle', () => {
    const cycle = resolveCreditCardCycle(new Date('2026-01-15T12:00:00.000Z'), 7);
    expect(cycle.closingDate.toISOString()).toBe('2026-01-28T00:00:00.000Z');
    expect(cycle.dueDate.toISOString()).toBe('2026-02-07T00:00:00.000Z');
    expect(cycle.monthKey).toBe('2026-02');
  });

  it('assigns purchases on closing day to the next cycle', () => {
    const cycle = resolveCreditCardCycle(new Date('2026-01-28T12:00:00.000Z'), 7);
    expect(cycle.closingDate.toISOString()).toBe('2026-02-28T00:00:00.000Z');
    expect(cycle.dueDate.toISOString()).toBe('2026-03-07T00:00:00.000Z');
    expect(cycle.monthKey).toBe('2026-03');
  });

  it('offsets installment cycles by month', () => {
    const first = resolveCreditCardCycle(new Date('2026-06-05T00:00:00.000Z'), 10, 0);
    const second = resolveCreditCardCycle(new Date('2026-06-05T00:00:00.000Z'), 10, 1);
    expect(first.monthKey).toBe('2026-07');
    expect(second.monthKey).toBe('2026-08');
  });

  it('returns remaining debt', () => {
    expect(invoiceBalance(300, 100)).toBe(200);
    expect(invoiceBalance(100, 150)).toBe(0);
  });

  it('is open before end of closing day', () => {
    const closingDate = new Date('2026-01-28T00:00:00.000Z');
    expect(isInvoiceCycleOpen('open', closingDate, new Date('2026-01-28T10:00:00.000Z'))).toBe(
      true,
    );
  });

  it('is closed after closing day ends', () => {
    const closingDate = new Date('2026-01-28T00:00:00.000Z');
    expect(isInvoiceCycleOpen('open', closingDate, new Date('2026-01-29T00:00:00.000Z'))).toBe(
      false,
    );
  });

  it('derives closing date in the month before due date', () => {
    const dueDate = new Date('2026-02-07T00:00:00.000Z');
    const closing = closingDateFromDueDate(dueDate, 7);
    expect(closing.toISOString()).toBe('2026-01-28T00:00:00.000Z');
  });
});
