import { Injectable } from '@nestjs/common';
import {
  NotificationCategory,
  NotificationKind,
  NotificationPeriod,
} from '@prisma/client';
import {
  assertResourceExists,
  assertResourceOwner,
} from '../../common/auth/ownership.util';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
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
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationService,
  ) {}

  async createMeasure(userId: string, data: CreateBodyMeasureDto) {
    const previous = await this.prisma.bodyMeasure.findFirst({
      where: { userId, weight: { not: null } },
      orderBy: { recordedAt: 'desc' },
      select: { weight: true },
    });

    const created = await this.prisma.bodyMeasure.create({
      data: { ...withRecordedAt(data), userId },
    });

    const newWeight = Number(created.weight ?? 0);
    const prevWeight = Number(previous?.weight ?? 0);
    if (newWeight > 0 && prevWeight > 0) {
      const delta = Math.round((newWeight - prevWeight) * 100) / 100;
      if (Math.abs(delta) >= 0.3) {
        await this.notifications.emit(userId, {
          dedupeKey: `body-weight-change-${created.id}`,
          period: NotificationPeriod.DAILY,
          category: NotificationCategory.BODY,
          kind: NotificationKind.INSIGHT,
          title: 'Change in your weight',
          body:
            delta < 0
              ? `You logged ${Math.abs(delta)} kg less than your last measurement.`
              : `You logged ${delta} kg more than your last measurement.`,
          href: '/body-metrics',
          ctaLabel: 'View metrics',
          metadata: { delta, weight: newWeight, previous: prevWeight },
        });
      }
    }

    return created;
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
