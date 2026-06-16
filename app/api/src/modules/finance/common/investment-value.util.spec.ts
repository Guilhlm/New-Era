import {
  computeGain,
  deriveInvestmentValues,
  resolveBuyTrade,
  resolveDebitUsdt,
} from '../common/investment-value.util';

describe('investment-value.util', () => {
  it('derives current and cost values from shares and prices', () => {
    const result = deriveInvestmentValues({
      shares: 10,
      avgPrice: 150,
      currentPrice: 175.43,
    });

    expect(result.currentValue).toBeCloseTo(1754.3);
    expect(result.costValue).toBeCloseTo(1500);
  });

  it('computes gain amount and percentage', () => {
    const { gainAmount, gainPct } = computeGain(1754.3, 1500);
    expect(gainAmount).toBeCloseTo(254.3);
    expect(gainPct).toBeCloseTo(16.953, 2);
  });

  describe('resolveBuyTrade', () => {
    it('fits a full-balance buy without exceeding wallet cents', () => {
      const balance = 1999;
      const price = 150.25;
      const result = resolveBuyTrade(price, balance, { budgetUsdt: balance });

      expect(result.debitUsdt).toBeLessThanOrEqual(balance);
      expect(result.shares).toBeGreaterThan(0);
      expect(result.debitUsdt * 100).toBeLessThanOrEqual(balance * 100 + 1);
    });

    it('accepts budgetUsdt equal to available balance', () => {
      const balance = 1000;
      const price = 50;
      const result = resolveBuyTrade(price, balance, { budgetUsdt: 1000 });

      expect(result.debitUsdt).toBeLessThanOrEqual(balance);
      expect(result.shares).toBeCloseTo(20, 5);
    });

    it('rejects when budget exceeds balance', () => {
      expect(() =>
        resolveBuyTrade(100, 50, { budgetUsdt: 51 }),
      ).toThrow('Insufficient wallet balance.');
    });

    it('rejects when price is unavailable', () => {
      expect(() => resolveBuyTrade(0, 1000, { budgetUsdt: 100 })).toThrow(
        'Market price unavailable.',
      );
    });

    it('sizes buy from shares when budgetUsdt is omitted', () => {
      const result = resolveBuyTrade(25, 500, { shares: 10 });
      expect(result.shares).toBe(10);
      expect(result.debitUsdt).toBe(250);
    });

    it('handles high-price crypto with fractional shares', () => {
      const balance = 1999;
      const price = 178.432156;
      const result = resolveBuyTrade(price, balance, { budgetUsdt: balance });

      expect(result.debitUsdt).toBeLessThanOrEqual(balance);
      expect(result.shares).toBeGreaterThanOrEqual(0.000001);
    });
  });

  describe('resolveDebitUsdt', () => {
    it('debits USDT using display-cent rules', () => {
      expect(resolveDebitUsdt(100, 'USDT', 100, 1)).toBe(100);
    });

    it('rejects USDT debit above balance', () => {
      expect(() => resolveDebitUsdt(100.01, 'USDT', 100, 1)).toThrow(
        'Insufficient wallet balance.',
      );
    });
  });
});
