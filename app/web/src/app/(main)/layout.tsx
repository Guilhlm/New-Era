import { AppSidebar } from '@/components/app-sidebar';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen w-full min-w-0 overflow-x-hidden">
      <AppSidebar />
      <div className="relative min-h-screen min-w-0 flex-1 overflow-x-hidden pl-[360px]">
        <div
          className="pointer-events-none absolute right-0 top-0 z-0 h-80 w-80 max-w-[min(100%,20rem)] bg-contain bg-right-top bg-no-repeat opacity-35 md:h-96 md:w-96"
          style={{ backgroundImage: 'url(/bg-splatter.png)' }}
          aria-hidden
        />
        <div className="relative z-10 mx-auto flex min-h-full w-full max-w-6xl flex-col px-4 py-6 md:px-6">
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
