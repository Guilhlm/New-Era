import { useCallback, useEffect } from 'react';
import { toastAuthError, toastUpdated } from '@/lib/app-toast';
import { useSiteTheme } from '@/components/theme-provider';
import { updateProfile } from '@/services/profile';
import type { MeUser } from '@/types/profile';
import { CRUD_TOAST } from '@/utils/crud-toast-messages';

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
        toastUpdated(CRUD_TOAST.themeUpdated);
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

