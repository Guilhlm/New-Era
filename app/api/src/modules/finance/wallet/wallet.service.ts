import { Injectable } from '@nestjs/common';
import { assertResourceExists, assertResourceOwner } from '../../../common/auth/ownership.util';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, data: Record<string, unknown>) {
    return this.prisma.wallet.create({
      data: { ...data, userId } as any,
    });
  }

  findByUser(userId: string) {
    return this.prisma.wallet.findMany({ where: { userId } });
  }

  async findOne(id: string, userId: string) {
    const wallet = await this.prisma.wallet.findUnique({ where: { id } });
    const existing = await assertResourceExists(wallet, 'Wallet');
    assertResourceOwner(existing.userId, userId, 'Wallet');
    return existing;
  }

  async update(id: string, userId: string, data: Record<string, unknown>) {
    await this.findOne(id, userId);
    return this.prisma.wallet.update({ where: { id }, data: data as any });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.wallet.delete({ where: { id } });
  }
}
