'use client';

import { NotificationsInbox } from '@/components/notifications/notifications-inbox';
import { useNotificationsDashboardState } from '@/hooks/use-notifications-dashboard-state';

export function NotificationsDashboard() {
  const state = useNotificationsDashboardState();

  return (
    <NotificationsInbox
      items={state.data.items}
      filter={state.data.filter}
      onFilterChange={state.actions.setFilter}
      onToggleRead={(id) => {
        const item = state.data.items.find((entry) => entry.id === id);
        if (!item) return;
        void state.actions.toggleRead(id, !item.read);
      }}
      onMarkAllRead={() => void state.actions.markAllRead()}
      className="h-full min-h-0"
    />
  );
}
