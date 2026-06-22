'use client';

import { useMemo, useState } from 'react';
import { TbBellOff, TbSearch } from 'react-icons/tb';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';
import { NotificationCard } from '@/components/notifications/notification-card';
import {
  countUnreadNotifications,
  filterByCategory,
  filterByKind,
  filterByPeriod,
  filterByPriority,
  filterNotifications,
  NOTIFICATION_CATEGORY_FILTERS,
  NOTIFICATION_FILTERS,
  NOTIFICATION_KIND_FILTERS,
  NOTIFICATION_PERIOD_FILTERS,
  NOTIFICATION_PRIORITY_FILTERS,
  searchNotifications,
  sortNotifications,
  type NotificationCategory,
  type NotificationFilter,
  type NotificationKind,
  type NotificationPeriod,
  type NotificationPriority,
  type NotificationVm,
} from '@/components/notifications/notifications-types';
import { typeClass, typeToneClass } from '@/lib/typography';

type NotificationsInboxProps = {
  items: NotificationVm[];
  filter: NotificationFilter;
  onFilterChange: (filter: NotificationFilter) => void;
  onToggleRead: (id: string) => void;
  onMarkAllRead: () => void;
  onArchive?: (id: string) => void;
  className?: string;
};

const selectClass =
  'h-9 shrink-0 rounded-lg bg-layer2 px-3 text-text outline-none focus-visible:ring-2 focus-visible:ring-red/50';

export function NotificationsInbox({
  items,
  filter,
  onFilterChange,
  onToggleRead,
  onMarkAllRead,
  onArchive,
  className,
}: NotificationsInboxProps) {
  const [search, setSearch] = useState('');
  const [kind, setKind] = useState<'all' | NotificationKind>('all');
  const [category, setCategory] = useState<'all' | NotificationCategory>('all');
  const [period, setPeriod] = useState<'all' | NotificationPeriod>('all');
  const [priority, setPriority] = useState<'all' | NotificationPriority>('all');

  const unreadCount = useMemo(() => countUnreadNotifications(items), [items]);

  const visibleItems = useMemo(() => {
    let result = filterNotifications(items, filter);
    result = filterByKind(result, kind);
    result = filterByCategory(result, category);
    result = filterByPeriod(result, period);
    result = filterByPriority(result, priority);
    result = searchNotifications(result, search);
    return sortNotifications(result);
  }, [items, filter, kind, category, period, priority, search]);

  return (
    <Card className={cn('flex h-full min-h-0 flex-col overflow-hidden p-5 lg:p-6', className)}>
      <h1 className={cn('shrink-0 mb-6', typeClass.title, typeToneClass.default)}>Notifications</h1>

      <div className="mt-2 grid w-full min-w-0 shrink-0 grid-cols-1 gap-2 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center xl:gap-3">
        <div className="scrollbar-none flex min-w-0 items-center gap-2 overflow-x-auto pb-0.5">
          {NOTIFICATION_FILTERS.map((option) => {
            const active = filter === option.id;
            const showUnreadBadge = option.id === 'unread' && unreadCount > 0;

            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={active}
                className={cn(
                  'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 transition',
                  typeClass.caption,
                  active ? 'bg-red text-on-accent' : 'bg-layer2 text-text/70 hover:bg-layer2-half hover:text-text',
                )}
                onClick={() => onFilterChange(option.id)}
              >
                {option.label}
                {showUnreadBadge ? (
                  <Badge
                    variant={active ? 'muted' : 'solid'}
                    className={cn('min-w-[1.25rem] px-1.5 py-0', typeClass.micro)}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="flex w-full min-w-0 flex-wrap items-center gap-2 xl:w-auto xl:flex-nowrap xl:justify-end">
          {unreadCount > 0 ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="h-9 shrink-0 px-3"
              onClick={onMarkAllRead}
            >
              Mark all as read
            </Button>
          ) : null}

          <select
            aria-label="Filter by type"
            value={kind}
            onChange={(event) => setKind(event.target.value as 'all' | NotificationKind)}
            className={cn(selectClass, typeClass.caption)}
          >
            {NOTIFICATION_KIND_FILTERS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by area"
            value={category}
            onChange={(event) => setCategory(event.target.value as 'all' | NotificationCategory)}
            className={cn(selectClass, typeClass.caption)}
          >
            {NOTIFICATION_CATEGORY_FILTERS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by period"
            value={period}
            onChange={(event) => setPeriod(event.target.value as 'all' | NotificationPeriod)}
            className={cn(selectClass, typeClass.caption)}
          >
            {NOTIFICATION_PERIOD_FILTERS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by priority"
            value={priority}
            onChange={(event) => setPriority(event.target.value as 'all' | NotificationPriority)}
            className={cn(selectClass, typeClass.caption)}
          >
            {NOTIFICATION_PRIORITY_FILTERS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>

          <label className="relative ml-auto flex h-9 min-w-0 flex-1 items-center sm:max-w-[20rem] xl:ml-0 xl:w-[18rem] xl:max-w-none xl:flex-none">
            <TbSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text/40" aria-hidden />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search notifications..."
              className={cn(
                'h-9 w-full min-w-0 rounded-lg bg-layer2 pl-9 pr-3 text-text outline-none placeholder:text-text/40 focus-visible:ring-2 focus-visible:ring-red/50',
                typeClass.caption,
              )}
            />
          </label>
        </div>
      </div>

      <div className="scrollbar-none mt-4 flex min-h-0 flex-1 flex-col gap-3 overflow-auto pr-1">
        {visibleItems.length === 0 ? (
          <div className="flex min-h-[14rem] flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-layer2 text-text/40">
              <TbBellOff className="h-6 w-6" aria-hidden />
            </div>
            <div>
              <p className={cn(typeClass.bodyStrong, typeToneClass.default)}>No notifications found</p>
              <p className={cn('mt-1', typeClass.caption, typeToneClass.muted60)}>
                {search
                  ? `No results for "${search}".`
                  : 'Adjust the filters to see other notifications.'}
              </p>
            </div>
          </div>
        ) : (
          <>
            {visibleItems.map((item) => (
              <NotificationCard
                key={item.id}
                item={item}
                onToggleRead={onToggleRead}
                onArchive={onArchive}
              />
            ))}

            <div className="flex items-center gap-3 py-4">
              <span className="h-px flex-1 bg-grey/60" aria-hidden />
              <p className={cn('shrink-0', typeClass.micro, typeToneClass.muted60)}>End of notifications</p>
              <span className="h-px flex-1 bg-grey/60" aria-hidden />
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
