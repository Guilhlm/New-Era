'use client';

import dynamic from 'next/dynamic';

export const AuthToasterClientOnly = dynamic(
  () => import('@/components/auth/auth-toaster').then((m) => m.AuthToaster),
  { ssr: false },
);

