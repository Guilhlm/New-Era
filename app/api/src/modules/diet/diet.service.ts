import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { scaleMacrosFrom100g } from './diet-macros.util';
import type {
  CreateDietFoodItemDto,
  CreateDietMealDto,
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

  async createMeal(data: CreateDietMealDto) {
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
      data,
      include: { items: { orderBy: { createdAt: 'asc' } } },
    });
  }

  async removeMeal(userId: string, mealId: string) {
    await this.assertMealOwner(userId, mealId);
    return this.prisma.dietMeal.delete({ where: { id: mealId } });
  }

  async createItem(userId: string, mealId: string, data: CreateDietFoodItemDto) {
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
        externalFoodId: data.externalFoodId,
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
    const meal = await this.prisma.dietMeal.findUnique({ where: { id: mealId } });
    if (!meal) throw new NotFoundException('Meal not found');
    if (meal.userId !== userId) throw new ForbiddenException('Not allowed');
    return meal;
  }

  private async assertItemOwner(userId: string, mealId: string, itemId: string) {
    await this.assertMealOwner(userId, mealId);
    const item = await this.prisma.dietFoodItem.findFirst({
      where: { id: itemId, mealId },
    });
    if (!item) throw new NotFoundException('Food item not found');
    return item;
  }
}
