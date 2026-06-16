/**
 * Reconciles wallet balances against transaction ledger effects.
 * Run: npx ts-node scripts/reconcile-finance.ts
 */
import { PrismaClient, TransactionType } from '@prisma/client';
import { FINANCE_TX_CATEGORY } from '../src/modules/finance/investment/dto/investment.dto';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, email: true } });
  let issues = 0;

  for (const user of users) {
    const wallets = await prisma.wallet.findMany({ where: { userId: user.id } });
    const transactions = await prisma.transaction.findMany({ where: { userId: user.id } });

    for (const wallet of wallets) {
      let expected = 0;
      for (const tx of transactions) {
        const amount = Number(tx.amount);
        if (tx.type === TransactionType.INCOME && tx.toWalletId === wallet.id) {
          expected += amount;
        }
        if (tx.type === TransactionType.EXPENSE && tx.fromWalletId === wallet.id) {
          expected -= amount;
        }
        if (
          tx.type === TransactionType.TRANSFER &&
          tx.fromWalletId === wallet.id
        ) {
          expected -= amount;
        }
        if (tx.type === TransactionType.TRANSFER && tx.toWalletId === wallet.id) {
          expected += amount;
        }
      }

      const actual = Number(wallet.balance);
      const delta = Math.abs(actual - expected);
      if (delta > 0.000001) {
        issues += 1;
        console.warn(
          `[${user.email}] wallet ${wallet.id} (${wallet.name}): balance=${actual} expected=${expected} delta=${delta}`,
        );
      }
    }

    const registers = transactions.filter(
      (tx) => tx.category === FINANCE_TX_CATEGORY.POSITION_REGISTER,
    );
    if (registers.length > 0) {
      console.log(
        `[${user.email}] ${registers.length} POSITION_REGISTER tx(s) — excluded from wallet reconciliation`,
      );
    }
  }

  if (issues === 0) {
    console.log('All wallet balances match transaction ledger.');
  } else {
    console.log(`${issues} wallet(s) with balance drift.`);
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
