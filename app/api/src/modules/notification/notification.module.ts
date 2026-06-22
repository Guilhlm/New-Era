import { Global, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { NotificationController } from './notification.controller';
import { NotificationGeneratorService } from './notification-generator.service';
import { NotificationSchedulerService } from './notification-scheduler.service';
import { NotificationService } from './notification.service';

@Global()
@Module({
  imports: [AuthModule],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationGeneratorService,
    NotificationSchedulerService,
  ],
  exports: [NotificationService, NotificationGeneratorService],
})
export class NotificationModule {}
