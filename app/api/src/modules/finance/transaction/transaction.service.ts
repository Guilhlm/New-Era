import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { TransactionType } from '@prisma/client';
import {
  assertResourceExists,
  assertResourceOwner,
} from '../../../common/auth/ownership.util';
import { PrismaService } from '../../../prisma/prisma.service';
import { syncUserFinanceState } from '../common/finance-balance.util';
import { FINANCE_TX_CATEGORY } from '../investment/dto/investment.dto';
import type {
  CreateTransactionDto,
  UpdateTransactionDto,
} from './dto/transaction.dto';

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: CreateTransactionDto) {
    await this.assertWalletsOwnership(userId, [
      data.fromWalletId,
      data.toWalletId,
    ]);

    const transaction = await this.prisma.$transaction(async (tx) => {
      if (data.type === TransactionType.INCOME && data.toWalletId) {
        await tx.wallet.update({
          where: { id: data.toWalletId },
          data: { balance: { increment: data.amount } },
        });
      }

      if (data.type === TransactionType.EXPENSE && data.fromWalletId) {
        await tx.wallet.update({
          where: { id: data.fromWalletId },
          data: { balance: { decrement: data.amount } },
        });
      }

      if (
        data.type === TransactionType.TRANSFER &&
        data.fromWalletId &&
        data.toWalletId
      ) {
        await tx.wallet.update({
          where: { id: data.fromWalletId },
          data: { balance: { decrement: data.amount } },
        });
        await tx.wallet.update({
          where: { id: data.toWalletId },
          data: { balance: { increment: data.amount } },
        });
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
      if (
        existing.type === TransactionType.INCOME &&
        existing.toWalletId &&
        existing.category === FINANCE_TX_CATEGORY.DEPOSIT
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
