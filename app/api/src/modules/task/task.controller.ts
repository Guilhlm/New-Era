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
import {
  CopyTaskDayDto,
  CreateTaskDto,
  CreateTasksBulkDto,
  UpdateTaskDto,
} from './dto/task.dto';
import { TaskService } from './task.service';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  findByWeekday(
    @Req() req: AuthenticatedRequest,
    @Query('weekday', ParseWeekdayPipe) weekday: number,
  ) {
    return this.taskService.findByWeekday(req.user.userId, weekday);
  }

  @Get('today')
  findToday(@Req() req: AuthenticatedRequest) {
    return this.taskService.findToday(req.user.userId);
  }

  @Get('summary')
  findSummary(@Req() req: AuthenticatedRequest) {
    return this.taskService.findWeekdaySummary(req.user.userId);
  }

  @Get('discipline/history')
  findDisciplineHistory(
    @Req() req: AuthenticatedRequest,
    @Query('days') daysRaw?: string,
    @Query('tab') tabRaw?: string,
  ) {
    const days = Number(daysRaw);
    const safeDays = days === 14 || days === 30 ? days : 7;
    const tab =
      tabRaw === 'financial'
        ? 'financial'
        : tabRaw === 'diet'
          ? 'diet'
          : 'training';
    return this.taskService.findDisciplineHistory(
      req.user.userId,
      safeDays,
      tab,
    );
  }

  @Get('suggestions')
  findSuggestions(
    @Req() req: AuthenticatedRequest,
    @Query('weekday', ParseWeekdayPipe) weekday: number,
  ) {
    return this.taskService.findSuggestions(req.user.userId, weekday);
  }

  @Post('bulk')
  createBulk(
    @Req() req: AuthenticatedRequest,
    @Body() body: CreateTasksBulkDto,
  ) {
    return this.taskService.createBulk({
      userId: req.user.userId,
      weekday: body.weekday,
      tasks: body.tasks,
    });
  }

  @Post('copy-day')
  copyDay(@Req() req: AuthenticatedRequest, @Body() body: CopyTaskDayDto) {
    return this.taskService.copyDay(
      req.user.userId,
      body.sourceWeekday,
      body.targetWeekday,
    );
  }

  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() body: CreateTaskDto) {
    return this.taskService.create({
      userId: req.user.userId,
      weekday: body.weekday,
      title: body.title,
      scheduledAt: body.scheduledAt,
      sourceType: body.sourceType,
      sourceId: body.sourceId,
    });
  }

  @Patch(':id')
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: UpdateTaskDto,
  ) {
    return this.taskService.update(req.user.userId, id, body);
  }

  @Delete(':id')
  remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.taskService.remove(req.user.userId, id);
  }

  @Post(':id/toggle-complete')
  toggleComplete(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.taskService.toggleComplete(req.user.userId, id);
  }
}
