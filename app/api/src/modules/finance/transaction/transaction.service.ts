import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Record<string, unknown>) {
    return this.prisma.transaction.create({ data: data as any });
  }

  findAll() {
    return this.prisma.transaction.findMany({
      include: {
        fromWallet: true,
        toWallet: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.transaction.findUnique({
      where: { id },
      include: {
        fromWallet: true,
        toWallet: true,
      },
    });
  }

  update(id: string, data: Record<string, unknown>) {
    return this.prisma.transaction.update({ where: { id }, data: data as any });
  }

  remove(id: string) {
    return this.prisma.transaction.delete({ where: { id } });
  }
}
