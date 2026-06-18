'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/cn';
import { NOTIFICATION_CATEGORY_CONFIG, type NotificationVm } from '@/components/notifications/notifications-types';
import { typeClass, typeToneClass } from '@/lib/typography';

type NotificationCardProps = {
  item: NotificationVm;
  onToggleRead: (id: string) => void;
};

export function NotificationCard({ item, onToggleRead }: NotificationCardProps) {
  const category = NOTIFICATION_CATEGORY_CONFIG[item.category];
  const Icon = category.Icon;

  return (
    <article
      className={cn(
        'flex min-w-0 flex-col gap-3 rounded-xl border p-4 transition sm:flex-row sm:items-center sm:gap-4',
        item.read
          ? 'border-grey/50 hover:border-grey hover:bg-layer2-half/15'
          : 'border-red/40 bg-red/[0.04] ring-1 ring-red/20 hover:border-red/55 hover:bg-red/[0.06]',
      )}
    >
      <div className="flex min-w-0 items-center gap-3 sm:flex-1 sm:gap-4">
        <div className="flex h-10 w-2 shrink-0 items-center justify-center" aria-hidden>
          {!item.read ? <span className="h-2 w-2 rounded-full bg-red" /> : null}
        </div>

        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: category.color }}
        >
          <Icon className="h-[1.125rem] w-[1.125rem] text-white" aria-hidden />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={cn(
              typeClass.bodyStrong,
              item.read ? typeToneClass.muted60 : typeToneClass.default,
            )}
          >
            {item.title}
          </p>
          <p className={cn('mt-1 line-clamp-2', typeClass.caption, typeToneClass.muted60)}>{item.body}</p>
        </div>
      </div>

      <div className="flex min-w-0 shrink-0 flex-col items-stretch gap-2 sm:items-end sm:justify-center">
        <span className={cn('text-right tabular-nums', typeClass.micro, typeToneClass.muted60)}>{item.timeLabel}</span>

        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {item.href ? (
            <Link
              href={item.href}
              className={cn(
                'inline-flex h-9 items-center justify-center rounded-md border border-grey/60 bg-transparent px-3 transition hover:bg-layer2',
                typeClass.caption,
                typeToneClass.default,
              )}
            >
              {item.ctaLabel ?? 'View details'}
            </Link>
          ) : null}

          {item.read ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-9 px-3"
              onClick={() => onToggleRead(item.id)}
            >
              Mark as unread
            </Button>
          ) : (
            <Button type="button" variant="primary" size="sm" className="h-9 px-3" onClick={() => onToggleRead(item.id)}>
              Mark as read
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
