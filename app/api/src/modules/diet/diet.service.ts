import { Injectable } from '@nestjs/common';
import {
  assertResourceExists,
  assertResourceOwner,
} from '../../common/auth/ownership.util';
import { PrismaService } from '../../prisma/prisma.service';
import { scaleMacrosFrom100g } from './diet-macros.util';
import type {
  CreateDietFoodItemDto,
  CreateDietMealInput,
  UpdateDietFoodItemDto,
  UpdateDietMealDto,
} from './dto/diet.dto';

@Injectable()
export class DietService {
  constructor(private readonly prisma: PrismaService) {}

  findByWeekday(userId: string, weekday: number) {
    return this.prisma.dietMeal.findMany({
      where: { userId, weekday, isActive: true },
      include: { items: { orderBy: { createdAt: 'asc' } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createMeal(data: CreateDietMealInput) {
    return this.prisma.dietMeal.create({
      data: {
        userId: data.userId,
        name: data.name,
        weekday: data.weekday,
        mealTime: data.mealTime ?? null,
      },
      include: { items: true },
    });
  }

  async updateMeal(userId: string, mealId: string, data: UpdateDietMealDto) {
    await this.assertMealOwner(userId, mealId);
    return this.prisma.dietMeal.update({
      where: { id: mealId },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.mealTime !== undefined ? { mealTime: data.mealTime } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
      include: { items: { orderBy: { createdAt: 'asc' } } },
    });
  }

  async removeMeal(userId: string, mealId: string) {
    await this.assertMealOwner(userId, mealId);
    return this.prisma.dietMeal.delete({ where: { id: mealId } });
  }

  async createItem(
    userId: string,
    mealId: string,
    data: CreateDietFoodItemDto,
  ) {
    await this.assertMealOwner(userId, mealId);

    const scaled = scaleMacrosFrom100g(
      {
        calories: data.caloriesPer100g,
        protein: data.proteinPer100g,
        carbs: data.carbsPer100g,
        fats: data.fatsPer100g,
      },
      data.totalGrams,
    );

    return this.prisma.dietFoodItem.create({
      data: {
        mealId,
        name: data.name,
        totalGrams: data.totalGrams,
        externalSource: data.externalSource,
        externalFoodId: data.externalFoodId ?? null,
        caloriesPer100g: data.caloriesPer100g,
        proteinPer100g: data.proteinPer100g,
        carbsPer100g: data.carbsPer100g,
        fatsPer100g: data.fatsPer100g,
        calories: scaled.calories,
        protein: scaled.protein,
        carbodrate: scaled.carbodrate,
        fats: scaled.fats,
      },
    });
  }

  async duplicateMeal(userId: string, mealId: string) {
    const meal = await this.assertMealOwner(userId, mealId);
    const items = await this.prisma.dietFoodItem.findMany({
      where: { mealId },
      orderBy: { createdAt: 'asc' },
    });

    return this.prisma.dietMeal.create({
      data: {
        userId,
        name: `${meal.name} (copy)`,
        weekday: meal.weekday,
        mealTime: meal.mealTime,
        items: {
          create: items.map((item) => ({
            name: item.name,
            totalGrams: item.totalGrams,
            externalSource: item.externalSource,
            externalFoodId: item.externalFoodId,
            caloriesPer100g: item.caloriesPer100g,
            proteinPer100g: item.proteinPer100g,
            carbsPer100g: item.carbsPer100g,
            fatsPer100g: item.fatsPer100g,
            calories: item.calories,
            protein: item.protein,
            carbodrate: item.carbodrate,
            fats: item.fats,
          })),
        },
      },
      include: { items: { orderBy: { createdAt: 'asc' } } },
    });
  }

  async copyDay(userId: string, sourceWeekday: number, targetWeekday: number) {
    if (sourceWeekday === targetWeekday) {
      return this.findByWeekday(userId, targetWeekday);
    }

    const sourceMeals = await this.prisma.dietMeal.findMany({
      where: { userId, weekday: sourceWeekday, isActive: true },
      include: { items: { orderBy: { createdAt: 'asc' } } },
      orderBy: { createdAt: 'asc' },
    });

    await this.prisma.$transaction(async (tx) => {
      await tx.dietMeal.deleteMany({
        where: { userId, weekday: targetWeekday },
      });

      for (const meal of sourceMeals) {
        await tx.dietMeal.create({
          data: {
            userId,
            name: meal.name,
            weekday: targetWeekday,
            mealTime: meal.mealTime,
            items: {
              create: meal.items.map((item) => ({
                name: item.name,
                totalGrams: item.totalGrams,
                externalSource: item.externalSource,
                externalFoodId: item.externalFoodId,
                caloriesPer100g: item.caloriesPer100g,
                proteinPer100g: item.proteinPer100g,
                carbsPer100g: item.carbsPer100g,
                fatsPer100g: item.fatsPer100g,
                calories: item.calories,
                protein: item.protein,
                carbodrate: item.carbodrate,
                fats: item.fats,
              })),
            },
          },
        });
      }
    });

    return this.findByWeekday(userId, targetWeekday);
  }

  async updateItem(
    userId: string,
    mealId: string,
    itemId: string,
    data: UpdateDietFoodItemDto,
  ) {
    const item = await this.assertItemOwner(userId, mealId, itemId);

    const scaled = scaleMacrosFrom100g(
      {
        calories: Number(item.caloriesPer100g ?? 0),
        protein: Number(item.proteinPer100g ?? 0),
        carbs: Number(item.carbsPer100g ?? 0),
        fats: Number(item.fatsPer100g ?? 0),
      },
      data.totalGrams,
    );

    return this.prisma.dietFoodItem.update({
      where: { id: itemId },
      data: {
        totalGrams: data.totalGrams,
        calories: scaled.calories,
        protein: scaled.protein,
        carbodrate: scaled.carbodrate,
        fats: scaled.fats,
      },
    });
  }

  async removeItem(userId: string, mealId: string, itemId: string) {
    await this.assertItemOwner(userId, mealId, itemId);
    return this.prisma.dietFoodItem.delete({ where: { id: itemId } });
  }

  private async assertMealOwner(userId: string, mealId: string) {
    const meal = await this.prisma.dietMeal.findUnique({
      where: { id: mealId },
    });
    const existing = assertResourceExists(meal, 'Meal');
    assertResourceOwner(existing.userId, userId, 'Meal');
    return existing;
  }

  private async assertItemOwner(
    userId: string,
    mealId: string,
    itemId: string,
  ) {
    await this.assertMealOwner(userId, mealId);
    const item = await this.prisma.dietFoodItem.findFirst({
      where: { id: itemId, mealId },
    });
    return assertResourceExists(item, 'Food item');
  }
}
