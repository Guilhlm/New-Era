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
import type { AuthenticatedRequest } from '../../common/auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  GenerateNotificationsDto,
  NotificationQueryDto,
  SnoozeNotificationDto,
  UpdateNotificationReadDto,
} from './dto/notification.dto';
import { NotificationGeneratorService } from './notification-generator.service';
import { NotificationService } from './notification.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly generatorService: NotificationGeneratorService,
  ) {}

  @Get()
  list(@Req() req: AuthenticatedRequest, @Query() query: NotificationQueryDto) {
    return this.notificationService.list(req.user.userId, query);
  }

  @Get('unread-count')
  unreadCount(@Req() req: AuthenticatedRequest) {
    return this.notificationService.unreadCount(req.user.userId);
  }

  @Post('generate')
  generate(@Req() req: AuthenticatedRequest, @Body() body: GenerateNotificationsDto) {
    return this.generatorService.generate(req.user.userId, body);
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

  @Post(':id/archive')
  archive(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.notificationService.archive(req.user.userId, id);
  }

  @Post(':id/snooze')
  snooze(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: SnoozeNotificationDto,
  ) {
    return this.notificationService.snooze(req.user.userId, id, body.minutes ?? 60);
  }
}
