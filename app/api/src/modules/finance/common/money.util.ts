import { Decimal } from '@prisma/client/runtime/library';

const USDT_SCALE = 1_000_000;

export class Money {
  private constructor(private readonly value: Decimal) {}

  static usdt(raw: string | number | Decimal): Money {
    if (raw instanceof Decimal) {
      return new Money(raw);
    }
    return new Money(new Decimal(raw));
  }

  static zero(): Money {
    return new Money(new Decimal(0));
  }

  add(other: Money): Money {
    return new Money(this.value.add(other.value));
  }

  sub(other: Money): Money {
    return new Money(this.value.sub(other.value));
  }

  mul(factor: number | Decimal): Money {
    return new Money(this.value.mul(factor));
  }

  div(divisor: number | Decimal): Money {
    return new Money(this.value.div(divisor));
  }

  gte(other: Money): boolean {
    return this.value.gte(other.value);
  }

  lte(other: Money): boolean {
    return this.value.lte(other.value);
  }

  toDecimal(): Decimal {
    return this.value;
  }

  toNumber(): number {
    return this.value.toNumber();
  }

  /** Rounded to 6 decimal places (ledger USDT). */
  toUsdtNumber(): number {
    return Math.round(this.value.toNumber() * USDT_SCALE) / USDT_SCALE;
  }

  /** Rounded to 2 decimal places for display comparison. */
  toDisplayCents(): number {
    const normalized = Math.round(this.value.toNumber() * 100) / 100;
    return Math.round(normalized * 100);
  }
}

export class Shares {
  private constructor(private readonly value: Decimal) {}

  static fromNumber(n: number): Shares {
    const rounded = Math.round(n * USDT_SCALE) / USDT_SCALE;
    return new Shares(new Decimal(rounded));
  }

  toDecimal(): Decimal {
    return this.value;
  }

  toNumber(): number {
    return this.value.toNumber();
  }
}

export function decimalUsdt(value: number): Decimal {
  return new Decimal(Money.usdt(value).toUsdtNumber());
}
