import { Global, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { NotificationController } from './notification.controller';
import { NotificationDesktopController } from './notification-desktop.controller';
import { DesktopNotificationBridgeService } from './desktop-notification-bridge.service';
import { NotificationDesktopPollerService } from './notification-desktop-poller.service';
import { NotificationGeneratorService } from './notification-generator.service';
import { NotificationSchedulerService } from './notification-scheduler.service';
import { NotificationService } from './notification.service';
import { TaskScheduleNotificationService } from './task-schedule-notification.service';

@Global()
@Module({
  imports: [AuthModule],
  controllers: [NotificationController, NotificationDesktopController],
  providers: [
    NotificationService,
    NotificationGeneratorService,
    NotificationSchedulerService,
    NotificationDesktopPollerService,
    TaskScheduleNotificationService,
    DesktopNotificationBridgeService,
  ],
  exports: [NotificationService, NotificationGeneratorService],
})
export class NotificationModule {}
