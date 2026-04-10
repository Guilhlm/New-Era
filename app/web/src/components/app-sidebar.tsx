'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IoLogOutOutline } from 'react-icons/io5';
import { MdOutlineRestaurant, MdOutlineTaskAlt } from 'react-icons/md';
import { RiHome4Line, RiWallet3Line } from 'react-icons/ri';
import { TbBell, TbReceipt, TbRulerMeasure, TbTarget, TbBarbell } from 'react-icons/tb';

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

function isActivePath(pathname: string, href: string) {
  if (href === '/') return pathname === '/' || pathname === '';
  return pathname === href || pathname.startsWith(`${href}/`);
}

async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = '/login';
}

export function AppSidebar() {
  const pathname = usePathname() ?? '';

  return (
    <aside
      className="fixed left-0 top-0 z-50 flex h-screen w-[360px] flex-col bg-layer1 px-7 py-6"
      aria-label="Navegação principal"
    >
      <div className="rounded-2xl bg-[#151515] px-4 py-6 mb-[60px]">
        <div className="flex items-center gap-3">
          <Link
            href="/perfil"
            className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full bg-layer2 text-sm font-semibold text-text transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red/50"
            aria-label="Ir para o perfil"
          >
            GM
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-text">Guilherme Maia</p>
            <p className="truncate text-xs text-grey-text">000.000.000-00</p>
          </div>
          <button
            type="button"
            onClick={() => void logout()}
            className="shrink-0 cursor-pointer rounded-lg p-2 text-red transition hover:bg-layer2-half hover:brightness-110"
            aria-label="Sair"
          >
            <IoLogOutOutline className="h-5 w-5" aria-hidden />
          </button>
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
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                    active
                      ? 'bg-layer2 text-text'
                      : 'text-grey-text hover:bg-layer2-half hover:text-text'
                  }`}
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
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                    active
                      ? 'bg-layer2 text-text'
                      : 'text-grey-text hover:bg-layer2-half hover:text-text'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden />
                  <span className="min-w-0 flex-1 truncate">{label}</span>
                  {badge ? (
                    <span className="shrink-0 rounded-full bg-red px-2 py-0.5 text-xs font-medium text-white">
                      {badge}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <footer className="mt-auto shrink-0 rounded-xl bg-layer2 px-4 py-6 text-center text-xs text-grey-text">
        © Guilherme Maia / New Era
      </footer>
    </aside>
  );
}
