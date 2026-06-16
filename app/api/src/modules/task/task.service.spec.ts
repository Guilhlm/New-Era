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
});
