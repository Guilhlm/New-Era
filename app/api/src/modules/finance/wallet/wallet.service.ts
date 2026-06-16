import { BadRequestException, Injectable } from '@nestjs/common';
import {
  assertResourceExists,
  assertResourceOwner,
} from '../../../common/auth/ownership.util';
import { PrismaService } from '../../../prisma/prisma.service';
import { syncUserFinanceState } from '../common/finance-balance.util';
import type { CreateWalletDto, UpdateWalletDto } from './dto/wallet.dto';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: CreateWalletDto) {
    const wallet = await this.prisma.wallet.create({
      data: {
        userId,
        name: data.name,
        type: data.type,
        balance: data.balance ?? 0,
      },
    });

    await syncUserFinanceState(this.prisma, userId);
    return wallet;
  }

  findByUser(userId: string) {
    return this.prisma.wallet.findMany({ where: { userId } });
  }

  async findOne(id: string, userId: string) {
    const wallet = await this.prisma.wallet.findUnique({ where: { id } });
    const existing = assertResourceExists(wallet, 'Wallet');
    assertResourceOwner(existing.userId, userId, 'Wallet');
    return existing;
  }

  async update(id: string, userId: string, data: UpdateWalletDto) {
    await this.findOne(id, userId);

    if (data.balance !== undefined) {
      throw new BadRequestException(
        'Direct balance updates are not allowed. Use deposit, withdraw, or trade endpoints.',
      );
    }

    const wallet = await this.prisma.wallet.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.type !== undefined ? { type: data.type } : {}),
      },
    });

    await syncUserFinanceState(this.prisma, userId);
    return wallet;
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.prisma.wallet.delete({ where: { id } });
    await syncUserFinanceState(this.prisma, userId);
    return { ok: true };
  }
}
