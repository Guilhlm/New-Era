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
import type { AuthenticatedRequest } from '../../../common/auth/auth.types';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import {
  CreateCardDto,
  CreateMonthlyExpenseCategoryDto,
  CreateMonthlyExpenseDto,
  MonthlyExpensesSummaryQueryDto,
  UpdateCardDto,
  UpdateMonthlyExpenseCategoryDto,
  UpdateMonthlyExpenseDto,
} from './dto/monthly-expense.dto';
import { MonthlyExpenseService } from './monthly-expense.service';

@Controller('finance/monthly-expenses')
@UseGuards(JwtAuthGuard)
export class MonthlyExpenseController {
  constructor(private readonly monthlyExpenseService: MonthlyExpenseService) {}

  @Get()
  getSummary(
    @Req() req: AuthenticatedRequest,
    @Query() query: MonthlyExpensesSummaryQueryDto,
  ) {
    return this.monthlyExpenseService.getSummary(req.user.userId, query);
  }

  @Post()
  createExpense(
    @Req() req: AuthenticatedRequest,
    @Body() data: CreateMonthlyExpenseDto,
  ) {
    return this.monthlyExpenseService.createExpense(req.user.userId, data);
  }

  @Get('categories')
  getCategories(
    @Req() req: AuthenticatedRequest,
    @Query('month') month?: string,
  ) {
    return this.monthlyExpenseService.listCategories(req.user.userId, month);
  }

  @Post('categories')
  createCategory(
    @Req() req: AuthenticatedRequest,
    @Body() data: CreateMonthlyExpenseCategoryDto,
  ) {
    return this.monthlyExpenseService.createCategory(req.user.userId, data);
  }

  @Patch('categories/:id')
  updateCategory(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() data: UpdateMonthlyExpenseCategoryDto,
  ) {
    return this.monthlyExpenseService.updateCategory(id, req.user.userId, data);
  }

  @Delete('categories/:id')
  deleteCategory(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.monthlyExpenseService.deleteCategory(id, req.user.userId);
  }

  @Get('cards')
  getCards(@Req() req: AuthenticatedRequest) {
    return this.monthlyExpenseService.listCards(req.user.userId);
  }

  @Post('cards')
  createCard(@Req() req: AuthenticatedRequest, @Body() data: CreateCardDto) {
    return this.monthlyExpenseService.createCard(req.user.userId, data);
  }

  @Patch('cards/:id')
  updateCard(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() data: UpdateCardDto,
  ) {
    return this.monthlyExpenseService.updateCard(id, req.user.userId, data);
  }

  @Delete('cards/:id')
  deleteCard(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.monthlyExpenseService.deleteCard(id, req.user.userId);
  }

  @Patch(':id')
  updateExpense(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() data: UpdateMonthlyExpenseDto,
  ) {
    return this.monthlyExpenseService.updateExpense(id, req.user.userId, data);
  }

  @Delete(':id')
  deleteExpense(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.monthlyExpenseService.deleteExpense(id, req.user.userId);
  }
}
