import type { Prisma } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';
import { decimalUsdt } from './money.util';

export async function creditWallet(
  tx: Prisma.TransactionClient,
  walletId: string,
  amountUsdt: number,
): Promise<void> {
  await tx.wallet.update({
    where: { id: walletId },
    data: { balance: { increment: decimalUsdt(amountUsdt) } },
  });
}

export async function debitWalletAtomic(
  tx: Prisma.TransactionClient,
  walletId: string,
  amountUsdt: number,
): Promise<void> {
  const amount = decimalUsdt(amountUsdt);
  const result = await tx.wallet.updateMany({
    where: {
      id: walletId,
      balance: { gte: amount },
    },
    data: {
      balance: { decrement: amount },
    },
  });

  if (result.count === 0) {
    throw new BadRequestException('Insufficient wallet balance.');
  }
}

export type FxSnapshot = {
  displayAmount?: number;
  displayCurrency?: 'USDT' | 'BRL';
  fxRate?: number;
};

export function fxSnapshotFields(snapshot: FxSnapshot) {
  if (snapshot.displayAmount == null) {
    return {};
  }

  return {
    displayAmount: decimalUsdt(snapshot.displayAmount),
    displayCurrency: snapshot.displayCurrency ?? null,
    fxRate: snapshot.fxRate != null ? decimalUsdt(snapshot.fxRate) : null,
  };
}
