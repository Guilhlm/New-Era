import {
  Controller,
  Headers,
  HttpCode,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { NotificationGeneratorService } from './notification-generator.service';
import { TaskScheduleNotificationService } from './task-schedule-notification.service';

@Controller('notifications/desktop')
export class NotificationDesktopController {
  constructor(
    private readonly generator: NotificationGeneratorService,
    private readonly taskSchedule: TaskScheduleNotificationService,
  ) {}

  @Post('generate')
  @HttpCode(204)
  async generate(@Headers('x-desktop-token') token?: string) {
    const expected = process.env.DESKTOP_IPC_TOKEN ?? '';
    if (!expected || token !== expected) {
      throw new UnauthorizedException();
    }

    if (process.env.APP_MODE !== 'desktop') {
      return;
    }

    await this.taskSchedule.processAllUsers();
    await this.generator.generateForAllUsers({
      includeDaily: true,
      includeWeekly: true,
      includeMonthly: true,
    });
  }
}
