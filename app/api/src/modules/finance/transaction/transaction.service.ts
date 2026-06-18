import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { TransactionType } from '@prisma/client';
import {
  assertResourceExists,
  assertResourceOwner,
} from '../../../common/auth/ownership.util';
import { PrismaService } from '../../../prisma/prisma.service';
import { syncUserFinanceState } from '../common/finance-balance.util';
import { creditWallet, debitWalletAtomic } from '../common/ledger.util';
import { FINANCE_TX_CATEGORY } from '../investment/dto/investment.dto';
import { reverseGoalContributionByTransaction } from '../financial-goal/finance-goal-contribution.util';
import type {
  CreateTransactionDto,
  UpdateTransactionDto,
} from './dto/transaction.dto';

/**
 * Categorias gerenciadas exclusivamente pelos fluxos de domínio
 * (deposit/withdraw/trade/goals). Não podem ser forjadas pelo endpoint genérico,
 * pois disparam lógica especial de reversão de saldo/portfólio.
 */
const RESERVED_TX_CATEGORIES = new Set<string>(
  Object.values(FINANCE_TX_CATEGORY),
);

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: CreateTransactionDto) {
    if (!(data.amount > 0)) {
      throw new BadRequestException('Amount must be greater than zero.');
    }

    if (data.category && RESERVED_TX_CATEGORIES.has(data.category)) {
      throw new BadRequestException(
        'This category is managed by deposit, withdraw, trade or goal flows.',
      );
    }

    if (data.type === TransactionType.TRANSFER) {
      if (!data.fromWalletId || !data.toWalletId) {
        throw new BadRequestException(
          'Transfers require both source and destination wallets.',
        );
      }
      if (data.fromWalletId === data.toWalletId) {
        throw new BadRequestException(
          'Source and destination wallets must differ.',
        );
      }
    }

    await this.assertWalletsOwnership(userId, [
      data.fromWalletId,
      data.toWalletId,
    ]);

    const transaction = await this.prisma.$transaction(async (tx) => {
      if (data.type === TransactionType.INCOME && data.toWalletId) {
        await creditWallet(tx, data.toWalletId, data.amount);
      }

      if (data.type === TransactionType.EXPENSE && data.fromWalletId) {
        await debitWalletAtomic(tx, data.fromWalletId, data.amount);
      }

      if (
        data.type === TransactionType.TRANSFER &&
        data.fromWalletId &&
        data.toWalletId
      ) {
        await debitWalletAtomic(tx, data.fromWalletId, data.amount);
        await creditWallet(tx, data.toWalletId, data.amount);
      }

      return tx.transaction.create({
        data: {
          userId,
          type: data.type,
          amount: data.amount,
          description: data.description ?? null,
          category: data.category ?? null,
          fromWalletId: data.fromWalletId ?? null,
          toWalletId: data.toWalletId ?? null,
          date: new Date(data.date),
        },
        include: { fromWallet: true, toWallet: true },
      });
    });

    await syncUserFinanceState(this.prisma, userId);
    return transaction;
  }

  findByUser(userId: string) {
    return this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 200,
      include: { fromWallet: true, toWallet: true },
    });
  }

  async findOne(id: string, userId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: { fromWallet: true, toWallet: true },
    });
    const existing = assertResourceExists(transaction, 'Transaction');
    assertResourceOwner(existing.userId, userId, 'Transaction');
    return existing;
  }

  async update(id: string, userId: string, _data: UpdateTransactionDto) {
    await this.findOne(id, userId);
    throw new BadRequestException(
      'Transactions are append-only. Create a reversal transaction instead of updating.',
    );
  }

  async remove(id: string, userId: string) {
    const existing = await this.findOne(id, userId);

    await this.prisma.$transaction(async (tx) => {
      if (existing.category === FINANCE_TX_CATEGORY.FINANCIAL_GOAL_CONTRIBUTION) {
        await reverseGoalContributionByTransaction(tx, userId, id);
        return;
      }

      if (
        existing.type === TransactionType.INCOME &&
        existing.toWalletId &&
        (existing.category === FINANCE_TX_CATEGORY.DEPOSIT ||
          existing.category === FINANCE_TX_CATEGORY.DEPOSIT_CARD ||
          existing.category === FINANCE_TX_CATEGORY.DEPOSIT_CASH ||
          existing.category === FINANCE_TX_CATEGORY.DEPOSIT_SALARY ||
          existing.category === FINANCE_TX_CATEGORY.DEPOSIT_EXTRA_INCOME)
      ) {
        await tx.wallet.update({
          where: { id: existing.toWalletId },
          data: { balance: { decrement: existing.amount } },
        });
      }

      if (
        existing.type === TransactionType.EXPENSE &&
        existing.fromWalletId &&
        existing.category === FINANCE_TX_CATEGORY.WITHDRAW
      ) {
        await tx.wallet.update({
          where: { id: existing.fromWalletId },
          data: { balance: { increment: existing.amount } },
        });
      }

      await tx.transaction.delete({ where: { id } });
    });

    await syncUserFinanceState(this.prisma, userId);
    return { ok: true };
  }

  private async assertWalletsOwnership(
    userId: string,
    walletIds: Array<string | null | undefined>,
  ) {
    const ids = [...new Set(walletIds.filter((id): id is string => !!id))];
    if (ids.length === 0) return;

    const wallets = await this.prisma.wallet.findMany({
      where: { id: { in: ids } },
      select: { id: true, userId: true },
    });

    for (const id of ids) {
      const wallet = wallets.find((entry) => entry.id === id);
      if (!wallet) {
        throw new NotFoundException('Wallet not found.');
      }
      assertResourceOwner(wallet.userId, userId, 'Wallet');
    }
  }
}
