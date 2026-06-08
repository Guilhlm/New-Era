import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type {
  CreateWorkoutExerciseDto,
  CreateWorkoutMuscleGroupDto,
  UpdateWorkoutDayPlanDto,
  UpdateWorkoutExerciseDto,
  UpdateWorkoutMuscleGroupDto,
} from './dto/workout.dto';

const groupInclude = {
  exercises: { orderBy: { sortOrder: 'asc' as const } },
};

const dayPlanInclude = {
  groups: {
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' as const },
    include: groupInclude,
  },
};

@Injectable()
export class WorkoutService {
  constructor(private readonly prisma: PrismaService) {}

  findByWeekday(userId: string, weekday: number) {
    return this.prisma.workoutDayPlan.findUnique({
      where: { userId_weekday: { userId, weekday } },
      include: dayPlanInclude,
    });
  }

  async findPlanSummary(userId: string) {
    return this.prisma.workoutDayPlan.findMany({
      where: { userId },
      select: { weekday: true, title: true, notes: true, isActive: true },
      orderBy: { weekday: 'asc' },
    });
  }

  async updateDayPlan(userId: string, weekday: number, data: UpdateWorkoutDayPlanDto) {
    const existing = await this.prisma.workoutDayPlan.findUnique({
      where: { userId_weekday: { userId, weekday } },
    });

    if (existing) {
      return this.prisma.workoutDayPlan.update({
        where: { id: existing.id },
        data,
        include: dayPlanInclude,
      });
    }

    return this.prisma.workoutDayPlan.create({
      data: {
        userId,
        weekday,
        title: data.title ?? 'Rest Day',
        notes: data.notes ?? null,
        isActive: data.isActive ?? true,
      },
      include: dayPlanInclude,
    });
  }

  async createGroup(userId: string, data: CreateWorkoutMuscleGroupDto) {
    const dayPlan = await this.ensureDayPlan(userId, data.weekday);

    const maxSort = await this.prisma.workoutMuscleGroup.aggregate({
      where: { dayPlanId: dayPlan.id, isActive: true },
      _max: { sortOrder: true },
    });

    return this.prisma.workoutMuscleGroup.create({
      data: {
        dayPlanId: dayPlan.id,
        name: data.name,
        timeMinutes: data.timeMinutes ?? null,
        sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
      },
      include: groupInclude,
    });
  }

  async updateGroup(userId: string, groupId: string, data: UpdateWorkoutMuscleGroupDto) {
    await this.assertGroupOwner(userId, groupId);
    return this.prisma.workoutMuscleGroup.update({
      where: { id: groupId },
      data,
      include: groupInclude,
    });
  }

  async removeGroup(userId: string, groupId: string) {
    await this.assertGroupOwner(userId, groupId);
    return this.prisma.workoutMuscleGroup.delete({ where: { id: groupId } });
  }

  async createExercise(userId: string, groupId: string, data: CreateWorkoutExerciseDto) {
    await this.assertGroupOwner(userId, groupId);

    const maxSort = await this.prisma.workoutExercise.aggregate({
      where: { groupId },
      _max: { sortOrder: true },
    });

    return this.prisma.workoutExercise.create({
      data: {
        groupId,
        name: data.name,
        equipment: data.equipment ?? null,
        weightKg: data.weightKg ?? null,
        series: data.series ?? null,
        repsMin: data.repsMin ?? null,
        repsMax: data.repsMax ?? null,
        imageUrl: data.imageUrl ?? null,
        sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
      },
    });
  }

  async updateExercise(
    userId: string,
    groupId: string,
    exerciseId: string,
    data: UpdateWorkoutExerciseDto,
  ) {
    await this.assertExerciseOwner(userId, groupId, exerciseId);
    return this.prisma.workoutExercise.update({
      where: { id: exerciseId },
      data,
    });
  }

  async removeExercise(userId: string, groupId: string, exerciseId: string) {
    await this.assertExerciseOwner(userId, groupId, exerciseId);
    return this.prisma.workoutExercise.delete({ where: { id: exerciseId } });
  }

  private async ensureDayPlan(userId: string, weekday: number) {
    const existing = await this.prisma.workoutDayPlan.findUnique({
      where: { userId_weekday: { userId, weekday } },
    });

    if (existing) return existing;

    return this.prisma.workoutDayPlan.create({
      data: {
        userId,
        weekday,
        title: 'Rest Day',
      },
    });
  }

  private async assertGroupOwner(userId: string, groupId: string) {
    const group = await this.prisma.workoutMuscleGroup.findUnique({
      where: { id: groupId },
      include: { dayPlan: true },
    });

    if (!group) {
      throw new NotFoundException('Muscle group not found');
    }

    if (group.dayPlan.userId !== userId) {
      throw new ForbiddenException('Not allowed');
    }

    return group;
  }

  private async assertExerciseOwner(userId: string, groupId: string, exerciseId: string) {
    await this.assertGroupOwner(userId, groupId);

    const exercise = await this.prisma.workoutExercise.findFirst({
      where: { id: exerciseId, groupId },
    });

    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }

    return exercise;
  }
}
