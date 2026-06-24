import { Injectable, Logger, Optional } from '@nestjs/common';
import { NotificationPriority } from '@prisma/client';

export type DesktopNotifyPayload = {
  notificationId: string;
  title: string;
  body: string;
  href?: string | null;
  priority: NotificationPriority;
};

@Injectable()
export class DesktopNotificationBridgeService {
  private readonly logger = new Logger(DesktopNotificationBridgeService.name);
  private readonly enabled = process.env.APP_MODE === 'desktop';
  private readonly ipcUrl =
    process.env.DESKTOP_IPC_URL ?? 'http://127.0.0.1:45678/notify';
  private readonly ipcToken = process.env.DESKTOP_IPC_TOKEN ?? '';

  constructor(@Optional() private readonly noop?: undefined) {}

  async notifyCreated(payload: DesktopNotifyPayload) {
    if (!this.enabled || !this.ipcToken) {
      return;
    }

    try {
      const response = await fetch(this.ipcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-IPC-Token': this.ipcToken,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        this.logger.warn(`Desktop IPC notify failed: HTTP ${response.status}`);
      }
    } catch (error) {
      this.logger.warn(
        `Desktop IPC notify unreachable: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );
    }
  }
}
