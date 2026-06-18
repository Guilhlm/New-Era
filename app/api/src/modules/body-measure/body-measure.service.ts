import { Injectable } from '@nestjs/common';
import {
  assertResourceExists,
  assertResourceOwner,
} from '../../common/auth/ownership.util';
import { PrismaService } from '../../prisma/prisma.service';
import type {
  CreateBodyMeasureDto,
  CreateBodyVitalDto,
} from './dto/body-measure.dto';

function withRecordedAt<T extends { recordedAt?: string }>(data: T) {
  const { recordedAt, ...rest } = data;
  return {
    ...rest,
    ...(recordedAt ? { recordedAt: new Date(recordedAt) } : {}),
  };
}

@Injectable()
export class BodyMeasureService {
  constructor(private readonly prisma: PrismaService) {}

  createMeasure(userId: string, data: CreateBodyMeasureDto) {
    return this.prisma.bodyMeasure.create({
      data: { ...withRecordedAt(data), userId },
    });
  }

  findMeasuresByUser(userId: string) {
    return this.prisma.bodyMeasure.findMany({
      where: { userId },
      orderBy: { recordedAt: 'desc' },
      take: 500,
    });
  }

  findLatestMeasure(userId: string) {
    return this.prisma.bodyMeasure.findFirst({
      where: { userId },
      orderBy: { recordedAt: 'desc' },
    }).then((measure) => measure ?? null);
  }

  async findOneMeasure(id: string, userId: string) {
    const measure = await this.prisma.bodyMeasure.findUnique({ where: { id } });
    const existing = assertResourceExists(measure, 'Measure');
    assertResourceOwner(existing.userId, userId, 'Measure');
    return existing;
  }

  async updateMeasure(id: string, userId: string, data: CreateBodyMeasureDto) {
    await this.findOneMeasure(id, userId);
    return this.prisma.bodyMeasure.update({
      where: { id },
      data: withRecordedAt(data),
    });
  }

  async removeMeasure(id: string, userId: string) {
    await this.findOneMeasure(id, userId);
    return this.prisma.bodyMeasure.delete({ where: { id } });
  }

  createVital(userId: string, data: CreateBodyVitalDto) {
    return this.prisma.bodyVital.create({
      data: { ...withRecordedAt(data), userId },
    });
  }

  findVitalsByUser(userId: string) {
    return this.prisma.bodyVital.findMany({
      where: { userId },
      orderBy: { recordedAt: 'desc' },
      take: 500,
    });
  }

  findLatestVital(userId: string) {
    return this.prisma.bodyVital.findFirst({
      where: { userId },
      orderBy: { recordedAt: 'desc' },
    }).then((vital) => vital ?? null);
  }

  async findOneVital(id: string, userId: string) {
    const vital = await this.prisma.bodyVital.findUnique({ where: { id } });
    const existing = assertResourceExists(vital, 'Vital');
    assertResourceOwner(existing.userId, userId, 'Vital');
    return existing;
  }

  async updateVital(id: string, userId: string, data: CreateBodyVitalDto) {
    await this.findOneVital(id, userId);
    return this.prisma.bodyVital.update({
      where: { id },
      data: withRecordedAt(data),
    });
  }

  async removeVital(id: string, userId: string) {
    await this.findOneVital(id, userId);
    return this.prisma.bodyVital.delete({ where: { id } });
  }
}
