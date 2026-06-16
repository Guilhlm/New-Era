import { Injectable } from '@nestjs/common';
import {
  assertResourceExists,
  assertResourceOwner,
} from '../../common/auth/ownership.util';
import { PrismaService } from '../../prisma/prisma.service';
import type { FitnessMacroGoalDto } from './dto/fitness-macro-goal.dto';

@Injectable()
export class FitnessMacroGoalService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, data: FitnessMacroGoalDto) {
    return this.prisma.fitnessMacroGoal.create({
      data: { ...data, userId } as any,
    });
  }

  findCurrentByUser(userId: string) {
    return this.prisma.fitnessMacroGoal.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  findByUser(userId: string) {
    return this.prisma.fitnessMacroGoal.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const goal = await this.prisma.fitnessMacroGoal.findUnique({
      where: { id },
    });
    const existing = assertResourceExists(goal, 'Fitness macro goal');
    assertResourceOwner(existing.userId, userId, 'Fitness macro goal');
    return existing;
  }

  async update(id: string, userId: string, data: FitnessMacroGoalDto) {
    await this.findOne(id, userId);
    return this.prisma.fitnessMacroGoal.update({
      where: { id },
      data: data as any,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.fitnessMacroGoal.delete({ where: { id } });
  }
}
