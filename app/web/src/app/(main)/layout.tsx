import { AppSidebar } from '@/components/app-sidebar';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen w-full min-w-0 overflow-x-hidden">
      <AppSidebar />
      <div className="relative flex min-h-screen min-w-0 flex-1 flex-col overflow-x-hidden py-6 pl-[calc(360px+1.5rem)] pr-6">
        <div
          className="pointer-events-none absolute right-0 top-0 z-0 h-80 w-80 max-w-[min(100%,20rem)] bg-contain bg-right-top bg-no-repeat opacity-35 md:h-96 md:w-96"
          style={{ backgroundImage: 'url(/bg-splatter.png)' }}
          aria-hidden
        />
        <div className="relative z-10 flex min-h-0 w-full min-w-0 max-w-[min(100%,90rem)] flex-1 flex-col">
          <main className="flex min-h-0 flex-1 flex-col">{children}</main>
        </div>
      </div>
    </div>
  );
}
