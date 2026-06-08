import { ForbiddenException, Injectable } from '@nestjs/common';
import { assertResourceExists, assertResourceOwner } from '../../common/auth/ownership.util';
import { PrismaService } from '../../prisma/prisma.service';
import type { BodyMeasureDto } from './dto/body-measure.dto';

@Injectable()
export class BodyMeasureService {
  constructor(private readonly prisma: PrismaService) {}

  createMeasure(userId: string, data: BodyMeasureDto) {
    return this.prisma.bodyMeasure.create({
      data: { ...data, userId } as any,
    });
  }

  findMeasuresByUser(userId: string) {
    return this.prisma.bodyMeasure.findMany({
      where: { userId },
      orderBy: { recordedAt: 'desc' },
    });
  }

  async findOneMeasure(id: string, userId: string) {
    const measure = await this.prisma.bodyMeasure.findUnique({ where: { id } });
    const existing = await assertResourceExists(measure, 'Measure');
    assertResourceOwner(existing.userId, userId, 'Measure');
    return existing;
  }

  async updateMeasure(id: string, userId: string, data: BodyMeasureDto) {
    await this.findOneMeasure(id, userId);
    return this.prisma.bodyMeasure.update({ where: { id }, data: data as any });
  }

  async removeMeasure(id: string, userId: string) {
    await this.findOneMeasure(id, userId);
    return this.prisma.bodyMeasure.delete({ where: { id } });
  }

  createVital(userId: string, data: BodyMeasureDto) {
    return this.prisma.bodyVital.create({
      data: { ...data, userId } as any,
    });
  }

  findVitalsByUser(userId: string) {
    return this.prisma.bodyVital.findMany({
      where: { userId },
      orderBy: { recordedAt: 'desc' },
    });
  }

  async findOneVital(id: string, userId: string) {
    const vital = await this.prisma.bodyVital.findUnique({ where: { id } });
    const existing = await assertResourceExists(vital, 'Vital');
    assertResourceOwner(existing.userId, userId, 'Vital');
    return existing;
  }

  async updateVital(id: string, userId: string, data: BodyMeasureDto) {
    await this.findOneVital(id, userId);
    return this.prisma.bodyVital.update({ where: { id }, data: data as any });
  }

  async removeVital(id: string, userId: string) {
    await this.findOneVital(id, userId);
    return this.prisma.bodyVital.delete({ where: { id } });
  }
}
