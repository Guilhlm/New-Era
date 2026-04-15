'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IoLogOutOutline } from 'react-icons/io5';
import { MdOutlineRestaurant, MdOutlineTaskAlt } from 'react-icons/md';
import { RiHome4Line, RiWallet3Line } from 'react-icons/ri';
import { TbBell, TbReceipt, TbRulerMeasure, TbTarget, TbBarbell } from 'react-icons/tb';
import { useSidebarUser } from '@/hooks/use-sidebar-user';
import { useLogout } from '@/hooks/use-logout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/cn';

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

const navSecondary: NavItem[] = [
  { href: '/wallet-investments', label: 'Wallet Investments', Icon: RiWallet3Line },
  { href: '/monthly-expenses', label: 'Monthly Expenses', Icon: TbReceipt },
  { href: '/finance-goals', label: 'Finances Goals', Icon: TbTarget },
  { href: '/notifications', label: 'Notifications', Icon: TbBell, badge: '8+' },
];
const navLinkClass = 'flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition';

function isActivePath(pathname: string, href: string) {
  if (href === '/') return pathname === '/' || pathname === '';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar() {
  const pathname = usePathname() ?? '';
  const { displayName, cpfLabel, avatarLetters, avatarPhoto } = useSidebarUser();
  const logout = useLogout();

  return (
    <aside
      className="fixed left-0 top-0 z-50 flex h-screen w-[360px] flex-col bg-layer1 px-7 py-6"
      aria-label="Main navigation"
    >
      <div
        className="mb-14 rounded-2xl px-4 py-6"
        style={{ backgroundColor: 'var(--color-layer2-half)' }}
      >
        <div className="flex items-center gap-2.5">
          <Link
            href="/perfil"
            className="relative flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-layer2 text-sm font-semibold text-text transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red/50"
            aria-label="Go to profile"
          >
            {avatarPhoto?.startsWith('data:') || avatarPhoto?.startsWith('http') ? (
              // eslint-disable-next-line @next/next/no-img-element -- data URL e URLs externas
              <img src={avatarPhoto} alt="" className="h-full w-full object-cover" />
            ) : avatarPhoto ? (
              <Image src={avatarPhoto} alt="" fill className="object-cover" sizes="48px" />
            ) : (
              avatarLetters
            )}
          </Link>
          <div className="ml-3 min-w-0 flex-1">
            <p className="truncate font-semibold text-text">{displayName || '…'}</p>
            <p className="truncate text-xs text-text/55">{cpfLabel || '…'}</p>
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

      <footer className="mt-auto shrink-0 rounded-xl bg-layer2 px-4 py-6 text-center text-xs text-text/55">
        © Guilherme Maia / New Era
      </footer>
    </aside>
  );
}
