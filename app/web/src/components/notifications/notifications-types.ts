import type { IconType } from 'react-icons';
import {
  TbBarbell,
  TbBell,
  TbReceipt,
  TbRulerMeasure,
  TbSalad,
  TbTarget,
} from 'react-icons/tb';
import { MdOutlineTaskAlt } from 'react-icons/md';
import { RiWallet3Line } from 'react-icons/ri';

export type NotificationCategory =
  | 'tasks'
  | 'finance'
  | 'goals'
  | 'wallet'
  | 'diet'
  | 'training'
  | 'body'
  | 'system';

export type NotificationKind = 'alert' | 'reminder' | 'insight' | 'update';
export type NotificationPriority = 'urgent' | 'normal' | 'low';
export type NotificationFilter = 'all' | 'unread' | NotificationKind;

export type NotificationVm = {
  id: string;
  category: NotificationCategory;
  kind: NotificationKind;
  priority: NotificationPriority;
  title: string;
  body: string;
  timeLabel: string;
  read: boolean;
  href?: string;
  ctaLabel?: string;
};

type CategoryConfig = {
  label: string;
  color: string;
  Icon: IconType;
};

export const NOTIFICATION_CATEGORY_CONFIG: Record<NotificationCategory, CategoryConfig> = {
  tasks: { label: 'Tasks', color: '#6366f1', Icon: MdOutlineTaskAlt },
  finance: { label: 'Finance', color: '#c45c4a', Icon: TbReceipt },
  goals: { label: 'Goals', color: '#16a34a', Icon: TbTarget },
  wallet: { label: 'Wallet', color: '#0ea5e9', Icon: RiWallet3Line },
  diet: { label: 'Diet', color: '#84cc16', Icon: TbSalad },
  training: { label: 'Training', color: '#f59e0b', Icon: TbBarbell },
  body: { label: 'Body', color: '#a855f7', Icon: TbRulerMeasure },
  system: { label: 'System', color: '#64748b', Icon: TbBell },
};

export const NOTIFICATION_FILTERS: { id: NotificationFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'alert', label: 'Alerts' },
  { id: 'reminder', label: 'Reminders' },
  { id: 'update', label: 'Updates' },
  { id: 'insight', label: 'Insights' },
];

export const INITIAL_NOTIFICATIONS: NotificationVm[] = [];

export function countUnreadNotifications(items: NotificationVm[]) {
  return items.filter((item) => !item.read).length;
}

export function formatUnreadBadge(count: number) {
  if (count <= 0) return undefined;
  return count > 9 ? '9+' : String(count);
}

export function filterNotifications(items: NotificationVm[], filter: NotificationFilter) {
  if (filter === 'all') return items;
  if (filter === 'unread') return items.filter((item) => !item.read);
  return items.filter((item) => item.kind === filter);
}

export function searchNotifications(items: NotificationVm[], query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return items;
  return items.filter(
    (item) =>
      item.title.toLowerCase().includes(normalized) || item.body.toLowerCase().includes(normalized),
  );
}

export function sortNotifications(items: NotificationVm[]) {
  return [...items].sort((a, b) => {
    if (a.read !== b.read) return a.read ? 1 : -1;
    return a.id.localeCompare(b.id);
  });
}
