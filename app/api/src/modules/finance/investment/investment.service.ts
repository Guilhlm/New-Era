import { Injectable } from '@nestjs/common';
import { assertResourceExists, assertResourceOwner } from '../../../common/auth/ownership.util';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class InvestmentService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, data: Record<string, unknown>) {
    return this.prisma.investment.create({
      data: { ...data, userId } as any,
    });
  }

  findByUser(userId: string) {
    return this.prisma.investment.findMany({ where: { userId } });
  }

  async findOne(id: string, userId: string) {
    const investment = await this.prisma.investment.findUnique({ where: { id } });
    const existing = await assertResourceExists(investment, 'Investment');
    assertResourceOwner(existing.userId, userId, 'Investment');
    return existing;
  }

  async update(id: string, userId: string, data: Record<string, unknown>) {
    await this.findOne(id, userId);
    return this.prisma.investment.update({ where: { id }, data: data as any });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.investment.delete({ where: { id } });
  }
}
