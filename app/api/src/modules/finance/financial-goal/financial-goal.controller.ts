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
  CreateFinancialGoalDto,
  FinancialGoalQueryDto,
  UpdateFinancialGoalDto,
  UpdateFinancialGoalProgressDto,
} from './dto/financial-goal.dto';
import { FinancialGoalService } from './financial-goal.service';

@Controller('finance/goals')
@UseGuards(JwtAuthGuard)
export class FinancialGoalController {
  constructor(private readonly financialGoalService: FinancialGoalService) {}

  @Get()
  list(
    @Req() req: AuthenticatedRequest,
    @Query() query: FinancialGoalQueryDto,
  ) {
    return this.financialGoalService.list(req.user.userId, query);
  }

  @Post()
  create(
    @Req() req: AuthenticatedRequest,
    @Body() data: CreateFinancialGoalDto,
  ) {
    return this.financialGoalService.create(req.user.userId, data);
  }

  @Patch(':id')
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() data: UpdateFinancialGoalDto,
  ) {
    return this.financialGoalService.update(id, req.user.userId, data);
  }

  @Patch(':id/progress')
  updateProgress(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() data: UpdateFinancialGoalProgressDto,
  ) {
    return this.financialGoalService.updateProgress(id, req.user.userId, data);
  }

  @Post(':id/complete')
  complete(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.financialGoalService.complete(id, req.user.userId);
  }

  @Delete(':goalId/activities/:activityId')
  removeActivity(
    @Req() req: AuthenticatedRequest,
    @Param('goalId') goalId: string,
    @Param('activityId') activityId: string,
  ) {
    return this.financialGoalService.removeActivity(
      goalId,
      activityId,
      req.user.userId,
    );
  }

  @Delete(':id')
  remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.financialGoalService.remove(id, req.user.userId);
  }
}
