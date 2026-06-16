import {
  Body,
  Controller,
  Get,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../../common/auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpsertWaterLogDto } from './dto/water-log.dto';
import { WaterLogService } from './water-log.service';

@Controller('water-logs')
@UseGuards(JwtAuthGuard)
export class WaterLogController {
  constructor(private readonly waterLogService: WaterLogService) {}

  @Get('day')
  getDayLog(@Req() req: AuthenticatedRequest, @Query('date') date?: string) {
    if (!date) {
      return this.waterLogService.getDayLog(
        req.user.userId,
        new Date().toISOString().slice(0, 10),
      );
    }
    return this.waterLogService.getDayLog(req.user.userId, date);
  }

  @Patch('day')
  upsertDayLog(
    @Req() req: AuthenticatedRequest,
    @Body() body: UpsertWaterLogDto,
  ) {
    return this.waterLogService.upsertDayLog(req.user.userId, body);
  }
}
