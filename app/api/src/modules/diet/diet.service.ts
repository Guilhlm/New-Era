import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DietService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Record<string, unknown>) {
    return this.prisma.dietMeal.create({ data: data as any });
  }

  findAll() {
    return this.prisma.dietMeal.findMany({
      include: { items: true },
    });
  }

  findOne(id: string) {
    return this.prisma.dietMeal.findUnique({
      where: { id },
      include: { items: true },
    });
  }

  update(id: string, data: Record<string, unknown>) {
    return this.prisma.dietMeal.update({ where: { id }, data: data as any });
  }

  remove(id: string) {
    return this.prisma.dietMeal.delete({ where: { id } });
  }
}
