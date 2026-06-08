import { Injectable } from '@nestjs/common';
import { assertResourceExists, assertResourceOwner } from '../../../common/auth/ownership.util';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, data: Record<string, unknown>) {
    return this.prisma.transaction.create({
      data: { ...data, userId } as any,
      include: { fromWallet: true, toWallet: true },
    });
  }

  findByUser(userId: string) {
    return this.prisma.transaction.findMany({
      where: { userId },
      include: { fromWallet: true, toWallet: true },
    });
  }

  async findOne(id: string, userId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: { fromWallet: true, toWallet: true },
    });
    const existing = await assertResourceExists(transaction, 'Transaction');
    assertResourceOwner(existing.userId, userId, 'Transaction');
    return existing;
  }

  async update(id: string, userId: string, data: Record<string, unknown>) {
    await this.findOne(id, userId);
    return this.prisma.transaction.update({
      where: { id },
      data: data as any,
      include: { fromWallet: true, toWallet: true },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.transaction.delete({ where: { id } });
  }
}
