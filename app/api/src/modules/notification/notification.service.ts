import { Injectable, Logger, Optional } from '@nestjs/common';
import { NotificationPriority, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { NotificationQueryDto, NotificationVm } from './dto/notification.dto';
import type { NotificationDraft } from './notification.helpers';
import { DesktopNotificationBridgeService } from './desktop-notification-bridge.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Optional()
    private readonly desktopBridge?: DesktopNotificationBridgeService,
  ) {}

  /**
   * Creates or refreshes a notification identified by `(userId, dedupeKey)`.
   * Recurring drafts can change their body/priority over time; the read state
   * is preserved on updates so the user never loses what they already saw.
   */
  async upsert(userId: string, draft: NotificationDraft) {
    const existing = draft.dedupeKey
      ? await this.prisma.notification.findUnique({
          where: { userId_dedupeKey: { userId, dedupeKey: draft.dedupeKey } },
        })
      : null;

    const result = await this.prisma.notification.upsert({
      where: { userId_dedupeKey: { userId, dedupeKey: draft.dedupeKey } },
      create: {
        userId,
        dedupeKey: draft.dedupeKey,
        period: draft.period,
        category: draft.category,
        kind: draft.kind,
        priority: draft.priority ?? NotificationPriority.NORMAL,
        title: draft.title,
        body: draft.body,
        href: draft.href,
        ctaLabel: draft.ctaLabel,
        metadata: draft.metadata ?? undefined,
        expiresAt: draft.expiresAt,
      },
      update: {
        period: draft.period,
        category: draft.category,
        kind: draft.kind,
        priority: draft.priority ?? NotificationPriority.NORMAL,
        title: draft.title,
        body: draft.body,
        href: draft.href,
        ctaLabel: draft.ctaLabel,
        metadata: draft.metadata ?? undefined,
        expiresAt: draft.expiresAt,
        archivedAt: null,
      },
    });

    if (this.shouldNotifyDesktop(existing, result)) {
      void this.desktopBridge?.notifyCreated({
        notificationId: result.id,
        title: result.title,
        body: result.body,
        href: result.href,
        priority: result.priority,
      });
    }

    return result;
  }

  private shouldNotifyDesktop(
    existing: Awaited<ReturnType<typeof this.prisma.notification.findUnique>> | null,
    result: {
      id: string;
      title: string;
      body: string;
      href: string | null;
      priority: NotificationPriority;
      read: boolean;
      archivedAt: Date | null;
    },
  ) {
    if (result.archivedAt || result.read) {
      return false;
    }
    if (!existing) {
      return true;
    }
    return (
      existing.title !== result.title ||
      existing.body !== result.body ||
      existing.priority !== result.priority
    );
  }

  /**
   * Fire-and-forget emission used by domain services on write operations.
   * Never throws so a notification failure can't break the core action.
   */
  async emit(userId: string, draft: NotificationDraft) {
    try {
      await this.upsert(userId, draft);
    } catch (error) {
      this.logger.warn(
        `Failed to emit notification "${draft.dedupeKey}" for user ${userId}: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );
    }
  }

  private mapNotification(
    item: Prisma.NotificationGetPayload<Prisma.NotificationDefaultArgs>,
  ): NotificationVm {
    return {
      id: item.id,
      category: item.category.toLowerCase() as NotificationVm['category'],
      kind: item.kind.toLowerCase() as NotificationVm['kind'],
      priority: item.priority.toLowerCase() as NotificationVm['priority'],
      period: item.period.toLowerCase() as NotificationVm['period'],
      title: item.title,
      body: item.body,
      read: item.read,
      href: item.href,
      ctaLabel: item.ctaLabel,
      metadata: (item.metadata as Record<string, unknown> | null) ?? null,
      createdAt: item.createdAt.toISOString(),
    };
  }

  private activeWhere(userId: string): Prisma.NotificationWhereInput {
    const now = new Date();
    return {
      userId,
      archivedAt: null,
      OR: [{ snoozedUntil: null }, { snoozedUntil: { lte: now } }],
      AND: [{ OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] }],
    };
  }

  async list(userId: string, query: NotificationQueryDto) {
    const base = this.activeWhere(userId);
    const where: Prisma.NotificationWhereInput = {
      ...base,
      ...(query.period ? { period: query.period } : {}),
      ...(query.kind ? { kind: query.kind } : {}),
      ...(query.category ? { category: query.category } : {}),
      ...(query.priority ? { priority: query.priority } : {}),
      ...(query.unreadOnly ? { read: false } : {}),
    };

    const [items, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: query.limit ?? 100,
      }),
      this.prisma.notification.count({
        where: { ...base, read: false },
      }),
    ]);

    return {
      unreadCount,
      items: items.map((item) => this.mapNotification(item)),
    };
  }

  async unreadCount(userId: string) {
    const unreadCount = await this.prisma.notification.count({
      where: { ...this.activeWhere(userId), read: false },
    });
    return { unreadCount };
  }

  async markRead(userId: string, id: string, read = true) {
    const existing = await this.prisma.notification.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return { ok: false };
    }
    await this.prisma.notification.update({
      where: { id },
      data: {
        read,
        readAt: read ? new Date() : null,
      },
    });
    return { ok: true };
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { ...this.activeWhere(userId), read: false },
      data: { read: true, readAt: new Date() },
    });
    return { ok: true };
  }

  async archive(userId: string, id: string) {
    const existing = await this.prisma.notification.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return { ok: false };
    }
    await this.prisma.notification.update({
      where: { id },
      data: { archivedAt: new Date(), read: true, readAt: existing.readAt ?? new Date() },
    });
    return { ok: true };
  }

  async snooze(userId: string, id: string, minutes = 60) {
    const existing = await this.prisma.notification.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return { ok: false };
    }
    await this.prisma.notification.update({
      where: { id },
      data: { snoozedUntil: new Date(Date.now() + minutes * 60_000) },
    });
    return { ok: true };
  }
}
