'use client';

import { useEffect, useState } from 'react';
import { useSiteTheme } from '@/components/theme-provider';
import { getProfile } from '@/services/profile';
import { PROFILE_UPDATED_EVENT } from '@/utils/events';
import { formatCpfDisplay, initialsFromName } from '@/utils/person';

export function useSidebarUser() {
  const [displayName, setDisplayName] = useState<string>('');
  const [cpfLabel, setCpfLabel] = useState<string>('');
  const [avatarLetters, setAvatarLetters] = useState<string>('?');
  const [avatarPhoto, setAvatarPhoto] = useState<string | null>(null);
  const { setTheme } = useSiteTheme();

  useEffect(() => {
    let cancelled = false;

    async function loadCard() {
      try {
        const user = await getProfile();
        if (cancelled) return;
        if (user.themePreference === 'dark' || user.themePreference === 'light') {
          setTheme(user.themePreference);
        }
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
      } catch {
        if (cancelled) return;
      }
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
  }, [setTheme]);

  return {
    displayName,
    cpfLabel,
    avatarLetters,
    avatarPhoto,
  };
}
