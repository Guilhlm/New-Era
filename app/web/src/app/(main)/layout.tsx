import { AppSidebar } from '@/components/app-sidebar';
import { NotificationsBackgroundSync } from '@/components/notifications/notifications-background-sync';
import { MainProviders } from '@/components/providers/main-providers';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <MainProviders>
      <NotificationsBackgroundSync />
      <div className="flex h-screen w-full min-w-0 overflow-hidden">
        <AppSidebar />
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pb-[1.5rem] pl-[1.5rem] pr-[1.5rem] pt-16 lg:pl-[calc(360px+1.5rem)] lg:pt-[1.5rem]">
          <div className="relative z-10 flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
            <main className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</main>
          </div>
        </div>
      </div>
    </MainProviders>
  );
}
