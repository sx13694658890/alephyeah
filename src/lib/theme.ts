export type ThemeMode = 'light' | 'dark';
export type ResolvedTheme = ThemeMode;

const STORAGE_KEY = 'alephyeah-theme';

export const resolveTheme = (mode: ThemeMode): ResolvedTheme => mode;

export const readStoredThemeMode = (): ThemeMode => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === 'light' || value === 'dark') return value;
    if (value === 'system') return 'light';
  } catch {
    /* ignore */
  }
  return 'light';
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
  applyResolvedTheme(mode);
  document.documentElement.dataset.themeMode = mode;
};
