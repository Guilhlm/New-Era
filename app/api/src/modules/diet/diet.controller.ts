import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../../common/auth/auth.types';
import { ParseWeekdayPipe } from '../../common/pipes/parse-weekday.pipe';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DietService } from './diet.service';
import {
  CopyDietDayDto,
  CreateDietFoodItemDto,
  CreateDietMealDto,
  UpdateDietFoodItemDto,
  UpdateDietMealDto,
} from './dto/diet.dto';

@Controller('diet')
@UseGuards(JwtAuthGuard)
export class DietController {
  constructor(private readonly dietService: DietService) {}

  @Get()
  findByWeekday(
    @Req() req: AuthenticatedRequest,
    @Query('weekday', ParseWeekdayPipe) weekday: number,
  ) {
    return this.dietService.findByWeekday(req.user.userId, weekday);
  }

  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() body: CreateDietMealDto) {
    return this.dietService.createMeal({
      userId: req.user.userId,
      name: body.name,
      weekday: body.weekday,
      mealTime: body.mealTime,
    });
  }

  @Post('copy-day')
  copyDay(@Req() req: AuthenticatedRequest, @Body() body: CopyDietDayDto) {
    return this.dietService.copyDay(
      req.user.userId,
      body.sourceWeekday,
      body.targetWeekday,
    );
  }

  @Post(':mealId/duplicate')
  duplicateMeal(
    @Req() req: AuthenticatedRequest,
    @Param('mealId') mealId: string,
  ) {
    return this.dietService.duplicateMeal(req.user.userId, mealId);
  }

  @Post(':mealId/items')
  createItem(
    @Req() req: AuthenticatedRequest,
    @Param('mealId') mealId: string,
    @Body() body: CreateDietFoodItemDto,
  ) {
    return this.dietService.createItem(req.user.userId, mealId, body);
  }

  @Patch(':mealId/items/:itemId')
  updateItem(
    @Req() req: AuthenticatedRequest,
    @Param('mealId') mealId: string,
    @Param('itemId') itemId: string,
    @Body() body: UpdateDietFoodItemDto,
  ) {
    return this.dietService.updateItem(req.user.userId, mealId, itemId, body);
  }

  @Delete(':mealId/items/:itemId')
  removeItem(
    @Req() req: AuthenticatedRequest,
    @Param('mealId') mealId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.dietService.removeItem(req.user.userId, mealId, itemId);
  }

  @Patch(':id')
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: UpdateDietMealDto,
  ) {
    return this.dietService.updateMeal(req.user.userId, id, body);
  }

  @Delete(':id')
  remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.dietService.removeMeal(req.user.userId, id);
  }
}
