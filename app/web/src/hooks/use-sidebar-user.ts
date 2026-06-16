'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { queryKeys } from '@/lib/query-keys';
import { getProfile } from '@/services/profile';
import { formatCpfDisplay, initialsFromName } from '@/utils/person';

export function useSidebarUser() {
  const query = useQuery({
    queryKey: queryKeys.me,
    queryFn: getProfile,
    retry: 3,
  });

  return useMemo(() => {
    const user = query.data;
    const name = user?.name?.trim() ?? '';
    const photo = user?.photoUser?.trim();
    const avatarPhoto =
      photo && (photo.startsWith('data:') || photo.startsWith('http') || photo.startsWith('/'))
        ? photo
        : null;

    return {
      displayName: name,
      cpfLabel: formatCpfDisplay(user?.cpf ?? undefined) ?? '—',
      avatarLetters: name ? initialsFromName(name) : '?',
      avatarPhoto,
    };
  }, [query.data]);
}
