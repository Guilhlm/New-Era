import { AuthScrollLock } from '@/components/auth/auth-scroll-lock';

export default function AuthGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AuthScrollLock />
      {children}
    </>
  );
}
