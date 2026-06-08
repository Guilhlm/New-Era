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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type {
  CreateWorkoutExerciseDto,
  CreateWorkoutMuscleGroupDto,
  UpdateWorkoutDayPlanDto,
  UpdateWorkoutExerciseDto,
  UpdateWorkoutMuscleGroupDto,
} from './dto/workout.dto';
import { WorkoutService } from './workout.service';

@Controller('workout')
@UseGuards(JwtAuthGuard)
export class WorkoutController {
  constructor(private readonly workoutService: WorkoutService) {}

  @Get('plan')
  findPlanSummary(@Req() req: AuthenticatedRequest) {
    return this.workoutService.findPlanSummary(req.user.userId);
  }

  @Get()
  findByWeekday(@Req() req: AuthenticatedRequest, @Query('weekday') weekdayRaw?: string) {
    const weekday = Number(weekdayRaw);
    if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) {
      return null;
    }
    return this.workoutService.findByWeekday(req.user.userId, weekday);
  }

  @Patch('day/:weekday')
  updateDayPlan(
    @Req() req: AuthenticatedRequest,
    @Param('weekday') weekdayRaw: string,
    @Body() body: UpdateWorkoutDayPlanDto,
  ) {
    const weekday = Number(weekdayRaw);
    return this.workoutService.updateDayPlan(req.user.userId, weekday, body);
  }

  @Post('groups')
  createGroup(@Req() req: AuthenticatedRequest, @Body() body: CreateWorkoutMuscleGroupDto) {
    return this.workoutService.createGroup(req.user.userId, body);
  }

  @Patch('groups/:id')
  updateGroup(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: UpdateWorkoutMuscleGroupDto,
  ) {
    return this.workoutService.updateGroup(req.user.userId, id, body);
  }

  @Delete('groups/:id')
  removeGroup(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.workoutService.removeGroup(req.user.userId, id);
  }

  @Post('groups/:groupId/exercises')
  createExercise(
    @Req() req: AuthenticatedRequest,
    @Param('groupId') groupId: string,
    @Body() body: CreateWorkoutExerciseDto,
  ) {
    return this.workoutService.createExercise(req.user.userId, groupId, body);
  }

  @Patch('groups/:groupId/exercises/:id')
  updateExercise(
    @Req() req: AuthenticatedRequest,
    @Param('groupId') groupId: string,
    @Param('id') id: string,
    @Body() body: UpdateWorkoutExerciseDto,
  ) {
    return this.workoutService.updateExercise(req.user.userId, groupId, id, body);
  }

  @Delete('groups/:groupId/exercises/:id')
  removeExercise(
    @Req() req: AuthenticatedRequest,
    @Param('groupId') groupId: string,
    @Param('id') id: string,
  ) {
    return this.workoutService.removeExercise(req.user.userId, groupId, id);
  }
}
