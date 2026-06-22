import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationGeneratorService } from './notification-generator.service';

/**
 * Periodically generates notifications for every user so recurring reminders and
 * dynamic alerts surface even when the user does not open the app.
 */
@Injectable()
export class NotificationSchedulerService {
  private readonly logger = new Logger(NotificationSchedulerService.name);

  constructor(private readonly generator: NotificationGeneratorService) {}

  @Cron(CronExpression.EVERY_DAY_AT_6AM, { name: 'notifications-daily' })
  async handleDaily() {
    const result = await this.generator.generateForAllUsers({
      includeDaily: true,
      includeWeekly: false,
      includeMonthly: false,
    });
    this.logger.log(`Daily notifications generated for ${result.users} user(s).`);
  }

  @Cron('0 7 * * 1', { name: 'notifications-weekly' })
  async handleWeekly() {
    const result = await this.generator.generateForAllUsers({
      includeDaily: false,
      includeWeekly: true,
      includeMonthly: false,
    });
    this.logger.log(`Weekly notifications generated for ${result.users} user(s).`);
  }

  @Cron('0 8 1 * *', { name: 'notifications-monthly' })
  async handleMonthly() {
    const result = await this.generator.generateForAllUsers({
      includeDaily: false,
      includeWeekly: false,
      includeMonthly: true,
    });
    this.logger.log(`Monthly notifications generated for ${result.users} user(s).`);
  }
}
