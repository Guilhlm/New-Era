import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { DietService } from './diet.service';

type MockTx = {
  dietMeal: {
    deleteMany: jest.Mock;
    create: jest.Mock;
  };
};

function createMockTx(): MockTx {
  return {
    dietMeal: {
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      create: jest.fn().mockResolvedValue({}),
    },
  };
}

describe('DietService', () => {
  let service: DietService;
  let tx: MockTx;
  let prisma: {
    dietMeal: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
      create: jest.Mock;
    };
    dietFoodItem: {
      findMany: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  const meal = {
    id: 'meal-1',
    userId: 'user-1',
    weekday: 1,
    name: 'Almoço',
    mealTime: '12:00',
    isActive: true,
  };

  const item = {
    id: 'item-1',
    mealId: 'meal-1',
    name: 'Arroz',
    totalGrams: 100,
    externalSource: 'taco',
    externalFoodId: 'taco-1',
    caloriesPer100g: 130,
    proteinPer100g: 2.5,
    carbsPer100g: 28,
    fatsPer100g: 0.2,
    calories: 130,
    protein: 2.5,
    carbodrate: 28,
    fats: 0.2,
  };

  beforeEach(async () => {
    tx = createMockTx();
    prisma = {
      dietMeal: {
        findUnique: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn().mockResolvedValue({ ...meal, items: [] }),
      },
      dietFoodItem: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      $transaction: jest
        .fn()
        .mockImplementation((callback: (txc: MockTx) => unknown) => callback(tx)),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [DietService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = moduleRef.get(DietService);
  });

  describe('duplicateMeal', () => {
    it('rejects meals that do not exist', async () => {
      prisma.dietMeal.findUnique.mockResolvedValue(null);
      await expect(service.duplicateMeal('user-1', 'missing')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('rejects meals owned by another user', async () => {
      prisma.dietMeal.findUnique.mockResolvedValue({ ...meal, userId: 'other' });
      await expect(service.duplicateMeal('user-1', 'meal-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('creates a copy on the same weekday with the copied items', async () => {
      prisma.dietMeal.findUnique.mockResolvedValue(meal);
      prisma.dietFoodItem.findMany.mockResolvedValue([item]);

      await service.duplicateMeal('user-1', 'meal-1');

      expect(prisma.dietMeal.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-1',
            name: 'Almoço (copy)',
            weekday: 1,
            items: {
              create: [expect.objectContaining({ name: 'Arroz', externalFoodId: 'taco-1' })],
            },
          }),
        }),
      );
    });
  });

  describe('copyDay', () => {
    it('returns the target day without mutating when source equals target', async () => {
      await service.copyDay('user-1', 2, 2);
      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(prisma.dietMeal.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-1', weekday: 2, isActive: true } }),
      );
    });

    it('replaces target meals atomically with the source meals', async () => {
      prisma.dietMeal.findMany.mockResolvedValueOnce([{ ...meal, items: [item] }]);

      await service.copyDay('user-1', 1, 3);

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(tx.dietMeal.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', weekday: 3 },
      });
      expect(tx.dietMeal.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-1',
            weekday: 3,
            name: 'Almoço',
            items: {
              create: [expect.objectContaining({ name: 'Arroz' })],
            },
          }),
        }),
      );
    });
  });
});
