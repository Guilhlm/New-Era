import {
  Body,
  Controller,
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
  GenerateNotificationsDto,
  NotificationQueryDto,
  UpdateNotificationReadDto,
} from './dto/notification.dto';
import { NotificationService } from './notification.service';

@Controller('finance/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  list(@Req() req: AuthenticatedRequest, @Query() query: NotificationQueryDto) {
    return this.notificationService.list(req.user.userId, query);
  }

  @Post('generate')
  generate(
    @Req() req: AuthenticatedRequest,
    @Body() body: GenerateNotificationsDto,
  ) {
    return this.notificationService.generateOnDemand(req.user.userId, body);
  }

  @Patch(':id/read')
  markRead(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: UpdateNotificationReadDto,
  ) {
    return this.notificationService.markRead(req.user.userId, id, body.read ?? true);
  }

  @Post('read-all')
  markAllRead(@Req() req: AuthenticatedRequest) {
    return this.notificationService.markAllRead(req.user.userId);
  }
}
