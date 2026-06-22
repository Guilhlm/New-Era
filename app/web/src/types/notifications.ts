export type NotificationRecord = {
  id: string;
  category: 'tasks' | 'finance' | 'goals' | 'wallet' | 'diet' | 'training' | 'body' | 'system';
  kind: 'alert' | 'reminder' | 'insight' | 'update';
  priority: 'urgent' | 'normal' | 'low';
  period: 'daily' | 'weekly' | 'monthly';
  title: string;
  body: string;
  read: boolean;
  href?: string | null;
  ctaLabel?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
};

export type NotificationsResponseRecord = {
  unreadCount: number;
  items: NotificationRecord[];
};
