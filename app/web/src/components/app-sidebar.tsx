'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { IoClose, IoLogOutOutline } from 'react-icons/io5';
import { MdOutlineRestaurant, MdOutlineTaskAlt } from 'react-icons/md';
import { RiHome4Line, RiWallet3Line } from 'react-icons/ri';
import { TbBell, TbMenu2, TbReceipt, TbRulerMeasure, TbTarget, TbBarbell } from 'react-icons/tb';
import { useSidebarUser } from '@/hooks/use-sidebar-user';
import { useLogout } from '@/hooks/use-logout';
import { useNotificationsUnreadCount } from '@/hooks/use-notifications-unread-count';
import { prefetchRouteData } from '@/lib/route-prefetch';
import {
  formatUnreadBadge,
} from '@/components/notifications/notifications-types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';

type NavItem = {
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  badge?: string;
};

const navPrimary: NavItem[] = [
  { href: '/', label: 'Home', Icon: RiHome4Line },
  { href: '/body-metrics', label: 'Body Metrics', Icon: TbRulerMeasure },
  { href: '/diet-area', label: 'Diet Area', Icon: MdOutlineRestaurant },
  { href: '/training-area', label: 'Training Area', Icon: TbBarbell },
  { href: '/create-tasks', label: 'Create Tasks', Icon: MdOutlineTaskAlt },
];

const navSecondaryBase: NavItem[] = [
  { href: '/wallet-investments', label: 'Wallet Investments', Icon: RiWallet3Line },
  { href: '/monthly-expenses', label: 'Monthly Expenses', Icon: TbReceipt },
  { href: '/finance-goals', label: 'Finances Goals', Icon: TbTarget },
  { href: '/notifications', label: 'Notifications', Icon: TbBell },
];

const navLinkClass = cn('flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5', typeClass.body, 'transition');

function isActivePath(pathname: string, href: string) {
  if (href === '/') return pathname === '/' || pathname === '';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar() {
  const pathname = usePathname() ?? '';
  const queryClient = useQueryClient();
  const { displayName, cpfLabel, avatarLetters, avatarPhoto } = useSidebarUser();
  const logout = useLogout();
  const unreadQuery = useNotificationsUnreadCount();
  const [mobileOpen, setMobileOpen] = useState(false);
  const notificationsBadge = formatUnreadBadge(unreadQuery.data ?? 0);
  const navSecondary = navSecondaryBase.map((item) =>
    item.href === '/notifications' ? { ...item, badge: notificationsBadge } : item,
  );

  const prefetchRoute = useCallback(
    (href: string) => {
      prefetchRouteData(queryClient, href);
    },
    [queryClient],
  );

  return (
    <>
      <button
        type="button"
        className="fixed left-4 top-4 z-40 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-grey bg-layer1 text-text lg:hidden"
        aria-label="Open menu"
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen(true)}
      >
        <TbMenu2 className="h-5 w-5" aria-hidden />
      </button>

      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          aria-hidden
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

    <aside
      className={cn(
        'fixed left-0 top-0 z-50 flex h-screen w-[360px] max-w-[85vw] flex-col border-r border-grey bg-layer1 px-7 py-6 transition-transform duration-200 lg:max-w-none lg:translate-x-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full',
      )}
      aria-label="Main navigation"
    >
      <button
        type="button"
        className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-lg text-text/60 hover:bg-layer2-half hover:text-text lg:hidden"
        aria-label="Close menu"
        onClick={() => setMobileOpen(false)}
      >
        <IoClose className="h-5 w-5" aria-hidden />
      </button>
      <div
        className="mb-14 rounded-2xl px-4 py-6"
        style={{ backgroundColor: 'var(--color-layer2-half)' }}
      >
        <div className="flex items-center gap-2.5">
          <Link
            href="/perfil"
            className={cn('relative flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-layer2 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red/50', typeClass.bodyStrong, typeToneClass.default)}
            aria-label="Go to profile"
          >
            {avatarPhoto?.startsWith('data:') || avatarPhoto?.startsWith('http') ? (
              // eslint-disable-next-line @next/next/no-img-element -- data URL e URLs externas
              <img
                src={avatarPhoto}
                alt={displayName ? `${displayName} profile photo` : 'Profile photo'}
                className="h-full w-full object-cover"
              />
            ) : avatarPhoto ? (
              <Image
                src={avatarPhoto}
                alt={displayName ? `${displayName} profile photo` : 'Profile photo'}
                fill
                className="object-cover"
                sizes="48px"
              />
            ) : (
              avatarLetters
            )}
          </Link>
          <div className="ml-3 min-w-0 flex-1">
            <p className={cn('truncate', typeClass.bodyStrong, typeToneClass.default)}>{displayName || '…'}</p>
            <p className={cn('truncate', typeClass.caption)}>{cpfLabel || '…'}</p>
          </div>
          <Button
            type="button"
            variant="ghostIcon"
            size="icon"
            radius="md"
            onClick={() => void logout.actions.runLogout()}
            disabled={logout.data.loading}
            className="shrink-0"
            aria-label="Sign out"
          >
            <IoLogOutOutline className="h-5 w-5" aria-hidden />
          </Button>
        </div>
      </div>

      <nav className="mt-6 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
        <ul className="flex flex-col gap-1">
          {navPrimary.map(({ href, label, Icon }) => {
            const active = isActivePath(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    navLinkClass,
                    active ? 'bg-layer2 text-text' : 'text-text/55 hover:bg-layer2-half hover:text-text',
                  )}
                  aria-current={active ? 'page' : undefined}
                  onMouseEnter={() => prefetchRoute(href)}
                  onFocus={() => prefetchRoute(href)}
                >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="my-4 h-px w-full bg-grey" role="separator" />

        <ul className="flex flex-col gap-1">
          {navSecondary.map(({ href, label, Icon, badge }) => {
            const active = isActivePath(pathname, href);

            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    navLinkClass,
                    active ? 'bg-layer2 text-text' : 'text-text/55 hover:bg-layer2-half hover:text-text',
                  )}
                  aria-current={active ? 'page' : undefined}
                  onMouseEnter={() => prefetchRoute(href)}
                  onFocus={() => prefetchRoute(href)}
                >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden />
                  <span className="min-w-0 flex-1 truncate">{label}</span>
                  {badge ? <Badge className="shrink-0">{badge}</Badge> : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <footer className={cn('mt-auto shrink-0 rounded-xl bg-layer2 px-4 py-6 text-center', typeClass.caption)}>
        © Guilherme Maia / New Era
      </footer>
    </aside>
    </>
  );
}
