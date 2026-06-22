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
export type NotificationPeriod = 'daily' | 'weekly' | 'monthly';
export type NotificationFilter = 'all' | 'unread' | NotificationKind;

export type NotificationVm = {
  id: string;
  category: NotificationCategory;
  kind: NotificationKind;
  priority: NotificationPriority;
  period: NotificationPeriod;
  title: string;
  body: string;
  timeLabel: string;
  createdAt: string;
  read: boolean;
  href?: string;
  ctaLabel?: string;
  metadata?: Record<string, unknown> | null;
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
];

export const NOTIFICATION_KIND_FILTERS: { id: 'all' | NotificationKind; label: string }[] = [
  { id: 'all', label: 'Any type' },
  { id: 'alert', label: 'Alerts' },
  { id: 'reminder', label: 'Reminders' },
  { id: 'update', label: 'Updates' },
  { id: 'insight', label: 'Insights' },
];

export const NOTIFICATION_CATEGORY_FILTERS: { id: 'all' | NotificationCategory; label: string }[] = [
  { id: 'all', label: 'All areas' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'finance', label: 'Finance' },
  { id: 'goals', label: 'Goals' },
  { id: 'wallet', label: 'Wallet' },
  { id: 'diet', label: 'Diet' },
  { id: 'training', label: 'Training' },
  { id: 'body', label: 'Body' },
  { id: 'system', label: 'System' },
];

export const NOTIFICATION_PERIOD_FILTERS: { id: 'all' | NotificationPeriod; label: string }[] = [
  { id: 'all', label: 'Any period' },
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
];

export const NOTIFICATION_PRIORITY_FILTERS: { id: 'all' | NotificationPriority; label: string }[] = [
  { id: 'all', label: 'Any priority' },
  { id: 'urgent', label: 'Urgent' },
  { id: 'normal', label: 'Normal' },
  { id: 'low', label: 'Low' },
];

export const NOTIFICATION_PRIORITY_CONFIG: Record<
  NotificationPriority,
  { label: string; className: string }
> = {
  urgent: { label: 'Urgent', className: 'bg-red/15 text-red' },
  normal: { label: 'Normal', className: 'bg-layer2 text-text/60' },
  low: { label: 'Low', className: 'bg-layer2 text-text/40' },
};

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

export function filterByKind(items: NotificationVm[], kind: 'all' | NotificationKind) {
  if (kind === 'all') return items;
  return items.filter((item) => item.kind === kind);
}

export function filterByCategory(
  items: NotificationVm[],
  category: 'all' | NotificationCategory,
) {
  if (category === 'all') return items;
  return items.filter((item) => item.category === category);
}

export function filterByPeriod(items: NotificationVm[], period: 'all' | NotificationPeriod) {
  if (period === 'all') return items;
  return items.filter((item) => item.period === period);
}

export function filterByPriority(
  items: NotificationVm[],
  priority: 'all' | NotificationPriority,
) {
  if (priority === 'all') return items;
  return items.filter((item) => item.priority === priority);
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
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    if (Number.isNaN(aTime) || Number.isNaN(bTime)) return b.id.localeCompare(a.id);
    return bTime - aTime;
  });
}
