'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from 'react';

import { applySiteTheme, type SiteTheme, THEME_STORAGE_KEY } from '@/lib/theme';

const THEME_EVENT = 'new-era-theme-change';

function emitThemeChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(THEME_EVENT));
  }
}

function subscribeTheme(onChange: () => void) {
  if (typeof window === 'undefined') {
    return () => {};
  }
  const handler = () => onChange();
  window.addEventListener(THEME_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(THEME_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

function readThemeFromDom(): SiteTheme {
  if (typeof document === 'undefined') return 'dark';
  return document.documentElement.classList.contains('light') ? 'light' : 'dark';
}

type ThemeContextValue = {
  theme: SiteTheme;
  setTheme: (t: SiteTheme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(
    subscribeTheme,
    readThemeFromDom,
    () => 'dark' as SiteTheme,
  );

  const setTheme = useCallback((t: SiteTheme) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, t);
    } catch {
      /* ignore */
    }
    applySiteTheme(t);
    emitThemeChange();
  }, []);

  const toggleTheme = useCallback(() => {
    const next = readThemeFromDom() === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }, [setTheme]);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useSiteTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useSiteTheme must be used within ThemeProvider');
  }
  return ctx;
}
