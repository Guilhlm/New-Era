import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { NotificationGeneratorService } from './notification-generator.service';

const DESKTOP_POLL_INTERVAL_MS = 45_000;
const DESKTOP_BOOTSTRAP_DELAY_MS = 5_000;

/**
 * Desktop runs a single-user SQLite API without external cron infrastructure.
 * Periodically generates notifications so Windows toasts can fire via IPC even
 * when the user is on another page or the window is hidden in the tray.
 */
@Injectable()
export class NotificationDesktopPollerService implements OnModuleInit {
  private readonly logger = new Logger(NotificationDesktopPollerService.name);
  private readonly enabled = process.env.APP_MODE === 'desktop';
  private ticking = false;

  constructor(private readonly generator: NotificationGeneratorService) {}

  onModuleInit() {
    if (!this.enabled) {
      return;
    }

    this.logger.log(
      `Desktop notification poller enabled (every ${DESKTOP_POLL_INTERVAL_MS / 1000}s).`,
    );

    setTimeout(() => {
      void this.tick('bootstrap');
    }, DESKTOP_BOOTSTRAP_DELAY_MS);

    setInterval(() => {
      void this.tick('interval');
    }, DESKTOP_POLL_INTERVAL_MS);
  }

  private async tick(reason: 'bootstrap' | 'interval') {
    if (this.ticking) {
      return;
    }

    this.ticking = true;
    try {
      await this.generator.generateForAllUsers({
        includeDaily: true,
        includeWeekly: true,
        includeMonthly: true,
      });
      this.logger.debug(`Desktop notification generation finished (${reason}).`);
    } catch (error) {
      this.logger.warn(
        `Desktop notification generation failed (${reason}): ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );
    } finally {
      this.ticking = false;
    }
  }
}
