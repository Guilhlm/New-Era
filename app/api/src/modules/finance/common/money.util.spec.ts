import { Decimal } from '@prisma/client/runtime/library';
import { Money, Shares, decimalUsdt } from './money.util';

describe('money.util', () => {
  it('rounds USDT to 6 decimal places', () => {
    expect(Money.usdt(1.23456789).toUsdtNumber()).toBe(1.234568);
  });

  it('converts display cents consistently', () => {
    expect(Money.usdt(1999.999).toDisplayCents()).toBe(200000);
  });

  it('adds and subtracts without drift', () => {
    const a = Money.usdt(100);
    const b = Money.usdt(50.25);
    expect(a.sub(b).toUsdtNumber()).toBeCloseTo(49.75, 6);
  });

  it('rounds shares to 6 decimals', () => {
    expect(Shares.fromNumber(0.123456789).toNumber()).toBe(0.123457);
  });

  it('serializes decimal USDT for Prisma', () => {
    expect(decimalUsdt(10.5).equals(new Decimal('10.5'))).toBe(true);
  });
});
