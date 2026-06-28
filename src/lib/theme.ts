export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'alephyeah-theme';

export const getSystemTheme = (): ResolvedTheme =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export const resolveTheme = (mode: ThemeMode): ResolvedTheme =>
  mode === 'system' ? getSystemTheme() : mode;

export const readStoredThemeMode = (): ThemeMode => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === 'light' || value === 'dark' || value === 'system') return value;
  } catch {
    /* ignore */
  }
  return 'system';
};

export const persistThemeMode = (mode: ThemeMode) => {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
};

export const applyResolvedTheme = (resolved: ResolvedTheme) => {
  const root = document.documentElement;
  root.classList.toggle('dark', resolved === 'dark');
  root.dataset.theme = resolved;
};

export const initTheme = () => {
  const mode = readStoredThemeMode();
  applyResolvedTheme(resolveTheme(mode));
  document.documentElement.dataset.themeMode = mode;
};

export const cycleThemeMode = (mode: ThemeMode): ThemeMode => {
  if (mode === 'light') return 'system';
  if (mode === 'system') return 'dark';
  return 'light';
};
