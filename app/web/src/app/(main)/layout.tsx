import { AppSidebar } from '@/components/app-sidebar';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen w-full min-w-0 overflow-hidden">
      <AppSidebar />
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden py-[1.5rem] pl-[calc(360px+1.5rem)] pr-[1.5rem]">
        <div className="relative z-10 flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
          <main className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</main>
        </div>
      </div>
    </div>
  );
}
