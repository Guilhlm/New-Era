import { LogoutButton } from '@/components/logout-button';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative mx-auto flex min-h-full w-full max-w-6xl flex-col px-4 py-6 md:px-6">
      <div
        className="pointer-events-none absolute -right-4 top-0 z-0 h-80 w-80 bg-contain bg-right-top bg-no-repeat opacity-35 md:h-96 md:w-96"
        style={{ backgroundImage: 'url(/bg-splatter.png)' }}
        aria-hidden
      />
      <header className="relative z-10 mb-8 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-text/50">App Pessoal</p>
          <h1 className="text-2xl font-semibold text-text">New-era</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-layer2 px-3 py-1 text-xs text-text">Dashboard</span>
          <LogoutButton />
        </div>
      </header>
      <main className="relative z-10 flex-1">{children}</main>
    </div>
  );
}
