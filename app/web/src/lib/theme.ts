export const THEME_STORAGE_KEY = 'new-era-theme';

export type SiteTheme = 'dark' | 'light';

export function applySiteTheme(theme: SiteTheme) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('light', theme === 'light');
}
