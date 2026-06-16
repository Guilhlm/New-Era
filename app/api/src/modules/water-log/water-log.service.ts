import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { UpsertWaterLogDto } from './dto/water-log.dto';

const DEFAULT_WATER_TOTAL = 3;
const WATER_GLASS_VOLUME_L = 0.3;

function parseLogDate(dateRaw: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateRaw)) {
    throw new BadRequestException('Invalid date');
  }
  const logDate = new Date(`${dateRaw}T00:00:00.000Z`);
  if (Number.isNaN(logDate.getTime())) {
    throw new BadRequestException('Invalid date');
  }
  return logDate;
}

function toNumber(
  value: Prisma.Decimal | number | null | undefined,
  fallback = 0,
) {
  if (value === null || value === undefined) return fallback;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function glassCountFromWaterTotal(waterTotal: number) {
  if (waterTotal <= 0) return 1;
  return Math.max(1, Math.ceil(waterTotal / WATER_GLASS_VOLUME_L - 1e-9));
}

@Injectable()
export class WaterLogService {
  constructor(private readonly prisma: PrismaService) {}

  async getDayLog(userId: string, dateRaw: string) {
    const logDate = parseLogDate(dateRaw);

    const log = await this.prisma.waterLog.findUnique({
      where: { userId_logDate: { userId, logDate } },
    });

    if (!log) {
      return {
        id: null,
        date: dateRaw,
        waterTotal: DEFAULT_WATER_TOTAL,
        waterIntake: 0,
        glassCount: glassCountFromWaterTotal(DEFAULT_WATER_TOTAL),
      };
    }

    const waterTotal = toNumber(log.waterTotal, DEFAULT_WATER_TOTAL);
    return {
      id: log.id,
      date: dateRaw,
      waterTotal,
      waterIntake: toNumber(log.waterIntake, 0),
      glassCount: glassCountFromWaterTotal(waterTotal),
    };
  }

  async upsertDayLog(userId: string, body: UpsertWaterLogDto) {
    const logDate = parseLogDate(body.date);

    const existing = await this.prisma.waterLog.findUnique({
      where: { userId_logDate: { userId, logDate } },
    });

    const waterTotal =
      body.waterTotal !== undefined
        ? Math.max(0, Number(body.waterTotal))
        : toNumber(existing?.waterTotal, DEFAULT_WATER_TOTAL);
    const waterIntake =
      body.waterIntake !== undefined
        ? Math.max(0, Number(body.waterIntake))
        : toNumber(existing?.waterIntake, 0);
    const glassCount = glassCountFromWaterTotal(waterTotal);

    const data = {
      waterTotal,
      waterIntake: Math.min(waterIntake, waterTotal),
      glassCount,
    };

    const log = await this.prisma.waterLog.upsert({
      where: { userId_logDate: { userId, logDate } },
      update: data,
      create: { userId, logDate, ...data },
    });

    const savedTotal = toNumber(log.waterTotal, DEFAULT_WATER_TOTAL);
    return {
      id: log.id,
      date: body.date,
      waterTotal: savedTotal,
      waterIntake: toNumber(log.waterIntake, 0),
      glassCount: glassCountFromWaterTotal(savedTotal),
    };
  }
}
