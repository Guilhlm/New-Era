import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Record<string, unknown>) {
    return this.prisma.wallet.create({ data: data as any });
  }

  findAll() {
    return this.prisma.wallet.findMany();
  }

  findOne(id: string) {
    return this.prisma.wallet.findUnique({ where: { id } });
  }

  update(id: string, data: Record<string, unknown>) {
    return this.prisma.wallet.update({ where: { id }, data: data as any });
  }

  remove(id: string) {
    return this.prisma.wallet.delete({ where: { id } });
  }
}
