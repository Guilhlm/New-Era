import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { TaskService } from './task.service';

type MockTx = {
  dailyTask: {
    findMany: jest.Mock;
    findUnique: jest.Mock;
    findUniqueOrThrow: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };
  taskCompletion: {
    findUnique: jest.Mock;
    create: jest.Mock;
    delete: jest.Mock;
  };
  user: {
    update: jest.Mock;
  };
};

function createMockTx(): MockTx {
  return {
    dailyTask: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    taskCompletion: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      update: jest.fn().mockResolvedValue({}),
    },
  };
}

describe('TaskService', () => {
  let service: TaskService;
  let tx: MockTx;
  let prisma: {
    dailyTask: MockTx['dailyTask'];
    taskCompletion: MockTx['taskCompletion'];
    user: MockTx['user'];
    workoutDayPlan: {
      findUnique: jest.Mock;
    };
    dietMeal: {
      findMany: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  const task = {
    id: 'task-1',
    userId: 'user-1',
    weekday: 1,
    title: 'Treinar',
    scheduledAt: '18:00',
    sortOrder: 0,
    isActive: true,
    sourceType: 'MANUAL',
    sourceId: null,
  };

  beforeEach(async () => {
    tx = createMockTx();
    prisma = {
      dailyTask: tx.dailyTask,
      taskCompletion: tx.taskCompletion,
      user: tx.user,
      workoutDayPlan: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
      dietMeal: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      $transaction: jest
        .fn()
        .mockImplementation((callback: (txc: MockTx) => unknown) =>
          callback(tx),
        ),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [TaskService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = moduleRef.get(TaskService);
  });

  describe('toggleComplete', () => {
    it('rejects tasks that do not exist', async () => {
      prisma.dailyTask.findUnique.mockResolvedValue(null);
      await expect(service.toggleComplete('user-1', 'missing')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('rejects tasks owned by another user', async () => {
      prisma.dailyTask.findUnique.mockResolvedValue({
        ...task,
        userId: 'someone-else',
      });
      await expect(service.toggleComplete('user-1', 'task-1')).rejects.toThrow(
        ForbiddenException,
      );
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('creates a completion and persists discipline inside a transaction', async () => {
      prisma.dailyTask.findUnique.mockResolvedValue(task);
      tx.taskCompletion.findUnique.mockResolvedValue(null);
      tx.dailyTask.findMany.mockResolvedValue([
        { ...task, completions: [{ id: 'c1' }] },
      ]);

      const result = await service.toggleComplete('user-1', 'task-1');

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(tx.taskCompletion.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ taskId: 'task-1' }),
      });
      expect(tx.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { disciplineLevel: 100 },
      });
      expect(result.discipline.percent).toBe(100);
    });

    it('removes an existing completion (un-toggle)', async () => {
      prisma.dailyTask.findUnique.mockResolvedValue(task);
      tx.taskCompletion.findUnique.mockResolvedValue({ id: 'completion-1' });
      tx.dailyTask.findMany.mockResolvedValue([{ ...task, completions: [] }]);

      const result = await service.toggleComplete('user-1', 'task-1');

      expect(tx.taskCompletion.delete).toHaveBeenCalledWith({
        where: { id: 'completion-1' },
      });
      expect(tx.taskCompletion.create).not.toHaveBeenCalled();
      expect(result.discipline.percent).toBe(0);
    });
  });

  describe('create', () => {
    it('creates the task and recalculates sort order atomically', async () => {
      tx.dailyTask.create.mockResolvedValue({ ...task });
      tx.dailyTask.findMany.mockResolvedValue([{ ...task, sortOrder: 5 }]);
      tx.dailyTask.findUniqueOrThrow.mockResolvedValue({ ...task });

      await service.create({
        userId: 'user-1',
        weekday: 1,
        title: 'Treinar',
        scheduledAt: '18:00',
      });

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(tx.dailyTask.create).toHaveBeenCalled();
      expect(tx.dailyTask.update).toHaveBeenCalledWith({
        where: { id: 'task-1' },
        data: { sortOrder: 0 },
      });
    });
  });

  describe('copyDay', () => {
    it('returns the target day without mutating when source equals target', async () => {
      prisma.dailyTask.findMany.mockResolvedValue([{ ...task, weekday: 2 }]);

      const result = await service.copyDay('user-1', 2, 2);

      expect(result).toHaveLength(1);
      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(prisma.dailyTask.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1', weekday: 2, isActive: true },
        }),
      );
    });

    it('copies only tasks missing from the target day inside a transaction', async () => {
      const linkedTask = {
        ...task,
        id: 'linked-source',
        title: 'Meal: Lunch',
        sourceType: 'DIET_MEAL',
        sourceId: 'meal-1',
      };
      const manualTask = { ...task, id: 'manual-source', title: 'Read', sourceId: null };
      const existingLinked = { ...linkedTask, id: 'linked-target', weekday: 3 };
      const copiedManual = { ...manualTask, id: 'manual-copy', weekday: 3, sortOrder: 5 };

      tx.dailyTask.findMany
        .mockResolvedValueOnce([linkedTask, manualTask])
        .mockResolvedValueOnce([existingLinked])
        .mockResolvedValueOnce([copiedManual])
        .mockResolvedValueOnce([copiedManual]);
      tx.dailyTask.create.mockResolvedValue(copiedManual);

      const result = await service.copyDay('user-1', 1, 3);

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(tx.dailyTask.create).toHaveBeenCalledTimes(1);
      expect(tx.dailyTask.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-1',
          weekday: 3,
          title: 'Read',
          sourceType: 'MANUAL',
          sourceId: null,
        }),
      });
      expect(tx.dailyTask.update).toHaveBeenCalledWith({
        where: { id: 'manual-copy' },
        data: { sortOrder: 0 },
      });
      expect(result).toEqual([copiedManual]);
    });
  });

  describe('findSuggestions', () => {
    it('does not suggest a meal task when an active task with the same title already exists', async () => {
      prisma.dailyTask.findMany.mockResolvedValue([
        {
          ...task,
          title: 'Meal: Lunch',
          sourceType: 'DIET_MEAL',
          sourceId: 'source-day-meal',
        },
      ]);
      prisma.dietMeal.findMany.mockResolvedValue([
        {
          id: 'target-day-meal',
          name: 'Lunch',
          mealTime: '12:00',
        },
      ]);

      const suggestions = await service.findSuggestions('user-1', 3);

      expect(suggestions).toEqual([]);
    });
  });
});
