import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WorkoutService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Record<string, unknown>) {
    return this.prisma.workoutSession.create({ data: data as any });
  }

  findAll() {
    return this.prisma.workoutSession.findMany();
  }

  findOne(id: string) {
    return this.prisma.workoutSession.findUnique({ where: { id } });
  }

  update(id: string, data: Record<string, unknown>) {
    return this.prisma.workoutSession.update({
      where: { id },
      data: data as any,
    });
  }

  remove(id: string) {
    return this.prisma.workoutSession.delete({ where: { id } });
  }
}
