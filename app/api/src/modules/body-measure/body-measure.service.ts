import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BodyMeasureService {
  constructor(private readonly prisma: PrismaService) {}

  createMeasure(data: Record<string, unknown>) {
    return this.prisma.bodyMeasure.create({ data: data as any });
  }

  findAllMeasures() {
    return this.prisma.bodyMeasure.findMany();
  }

  findOneMeasure(id: string) {
    return this.prisma.bodyMeasure.findUnique({ where: { id } });
  }

  updateMeasure(id: string, data: Record<string, unknown>) {
    return this.prisma.bodyMeasure.update({ where: { id }, data: data as any });
  }

  removeMeasure(id: string) {
    return this.prisma.bodyMeasure.delete({ where: { id } });
  }

  createVital(data: Record<string, unknown>) {
    return this.prisma.bodyVital.create({ data: data as any });
  }

  findAllVitals() {
    return this.prisma.bodyVital.findMany();
  }

  findOneVital(id: string) {
    return this.prisma.bodyVital.findUnique({ where: { id } });
  }

  updateVital(id: string, data: Record<string, unknown>) {
    return this.prisma.bodyVital.update({ where: { id }, data: data as any });
  }

  removeVital(id: string) {
    return this.prisma.bodyVital.delete({ where: { id } });
  }
}
