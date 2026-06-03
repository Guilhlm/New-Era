import { useCallback, useEffect } from 'react';
import { toastAuthError } from '@/components/auth/auth-error-toast';
import { useSiteTheme } from '@/components/theme-provider';
import { updateProfile } from '@/services/profile';
import type { MeUser } from '@/types/profile';

type UseThemePreferenceParams = {
  user: MeUser | null;
};

export function useThemePreference({ user }: UseThemePreferenceParams) {
  const { theme, setTheme } = useSiteTheme();

  useEffect(() => {
    if (user?.themePreference === 'dark' || user?.themePreference === 'light') {
      setTheme(user.themePreference);
    }
  }, [setTheme, user?.themePreference]);

  const toggleTheme = useCallback(() => {
    if (!user?.id) {
      const next = theme === 'dark' ? 'light' : 'dark';
      setTheme(next);
      return;
    }

    const prev = theme;
    const next = prev === 'dark' ? 'light' : 'dark';
    setTheme(next);

    void (async () => {
      try {
        await updateProfile({ themePreference: next });
      } catch (error) {
        setTheme(prev);
        const message = error instanceof Error ? error.message : 'Não foi possível salvar o tema.';
        toastAuthError(message);
      }
    })();
  }, [setTheme, theme, user?.id]);

  return {
    data: {
      theme,
    },
    actions: {
      toggleTheme,
    },
  };
}

