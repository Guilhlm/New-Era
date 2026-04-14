'use client';

import { useEffect, useState } from 'react';
import type { AuthMeUser } from '@/types/auth';
import { PROFILE_UPDATED_EVENT } from '@/utils/events';
import { formatCpfDisplay, initialsFromName } from '@/utils/person';

export function useSidebarUser() {
  const [displayName, setDisplayName] = useState<string>('');
  const [cpfLabel, setCpfLabel] = useState<string>('');
  const [avatarLetters, setAvatarLetters] = useState<string>('?');
  const [avatarPhoto, setAvatarPhoto] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCard() {
      const res = await fetch('/api/auth/me');
      if (!res.ok || cancelled) return;
      const user = (await res.json()) as AuthMeUser;
      if (cancelled) return;
      const name = user.name?.trim() ?? '';
      if (name) {
        setDisplayName(name);
        setAvatarLetters(initialsFromName(name));
      }
      const formatted = formatCpfDisplay(user.cpf ?? undefined);
      setCpfLabel(formatted ?? '—');
      const p = user.photoUser?.trim();
      setAvatarPhoto(
        p && (p.startsWith('data:') || p.startsWith('http') || p.startsWith('/')) ? p : null,
      );
    }

    void loadCard();

    function onProfileUpdated() {
      void loadCard();
    }

    window.addEventListener(PROFILE_UPDATED_EVENT, onProfileUpdated);
    return () => {
      cancelled = true;
      window.removeEventListener(PROFILE_UPDATED_EVENT, onProfileUpdated);
    };
  }, []);

  return {
    displayName,
    cpfLabel,
    avatarLetters,
    avatarPhoto,
  };
}
