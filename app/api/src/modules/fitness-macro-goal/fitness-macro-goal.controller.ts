import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../../common/auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FitnessMacroGoalDto } from './dto/fitness-macro-goal.dto';
import { FitnessMacroGoalService } from './fitness-macro-goal.service';

@Controller('fitness-macro-goals')
@UseGuards(JwtAuthGuard)
export class FitnessMacroGoalController {
  constructor(
    private readonly fitnessMacroGoalService: FitnessMacroGoalService,
  ) {}

  @Get('current')
  findCurrent(@Req() req: AuthenticatedRequest) {
    return this.fitnessMacroGoalService.findCurrentByUser(req.user.userId);
  }

  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() data: FitnessMacroGoalDto) {
    return this.fitnessMacroGoalService.create(req.user.userId, data);
  }

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.fitnessMacroGoalService.findByUser(req.user.userId);
  }

  @Get(':id')
  findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.fitnessMacroGoalService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() data: FitnessMacroGoalDto,
  ) {
    return this.fitnessMacroGoalService.update(id, req.user.userId, data);
  }

  @Delete(':id')
  remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.fitnessMacroGoalService.remove(id, req.user.userId);
  }
}
