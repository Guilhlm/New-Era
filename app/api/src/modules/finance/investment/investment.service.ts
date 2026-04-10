import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class InvestmentService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Record<string, unknown>) {
    return this.prisma.investment.create({ data: data as any });
  }

  findAll() {
    return this.prisma.investment.findMany();
  }

  findOne(id: string) {
    return this.prisma.investment.findUnique({ where: { id } });
  }

  update(id: string, data: Record<string, unknown>) {
    return this.prisma.investment.update({ where: { id }, data: data as any });
  }

  remove(id: string) {
    return this.prisma.investment.delete({ where: { id } });
  }
}
