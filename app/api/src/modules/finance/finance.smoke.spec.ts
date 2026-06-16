import {
  computeGain,
  deriveInvestmentValues,
  isActivePosition,
  resolveBuyTrade,
  resolveDebitUsdt,
} from './common/investment-value.util';

describe('finance smoke', () => {
  it('derives investment values', () => {
    const derived = deriveInvestmentValues({
      shares: 1,
      avgPrice: 100,
      currentPrice: 110,
    });
    expect(derived.currentValue).toBe(110);
  });

  it('computes gain', () => {
    const { gainAmount } = computeGain(110, 100);
    expect(gainAmount).toBe(10);
  });

  it('fits full balance buy', () => {
    const result = resolveBuyTrade(50, 1999, { budgetUsdt: 1999 });
    expect(result.debitUsdt).toBeLessThanOrEqual(1999);
  });

  it('validates withdraw debit', () => {
    expect(resolveDebitUsdt(100, 'USDT', 100, 1)).toBe(100);
  });

  it('ignores zero-share positions in gain totals', () => {
    const active = deriveInvestmentValues({ shares: 1, avgPrice: 100, currentPrice: 110 });
    const closed = deriveInvestmentValues({ shares: 0, avgPrice: 100, currentPrice: 110 });
    const positions = isActivePosition(1) ? [active] : [];
    if (isActivePosition(0)) positions.push(closed);

    const investedTotal = positions.reduce((sum, p) => sum + p.currentValue, 0);
    const costTotal = positions.reduce((sum, p) => sum + p.costValue, 0);
    const { gainAmount } = computeGain(investedTotal, costTotal);

    expect(positions).toHaveLength(1);
    expect(gainAmount).toBe(10);
    expect(isActivePosition(0)).toBe(false);
  });
});
