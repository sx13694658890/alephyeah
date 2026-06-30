import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  LOCALE_STORAGE_KEY,
  messages,
  type Locale,
} from '../i18n/locales';
import {
  applyResolvedTheme,
  persistThemeMode,
  readStoredThemeMode,
  resolveTheme,
  type ResolvedTheme,
  type ThemeMode,
} from '../lib/theme';

type MessageTree = typeof messages.en;

const readStoredLocale = (): Locale => {
  try {
    const value = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (value === 'en' || value === 'zh') return value;
  } catch {
    /* ignore */
  }
  return 'zh';
};

const getMessage = (tree: MessageTree, path: string): string => {
  const value = path.split('.').reduce<unknown>((node, key) => {
    if (node && typeof node === 'object' && key in node) {
      return (node as Record<string, unknown>)[key];
    }
    return undefined;
  }, tree);
  return typeof value === 'string' ? value : path;
};

interface PreferencesContextValue {
  themeMode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setThemeMode: (mode: ThemeMode) => void;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (path: string) => string;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export const PreferencesProvider = ({ children }: { children: ReactNode }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(readStoredThemeMode);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    resolveTheme(readStoredThemeMode()),
  );
  const [locale, setLocaleState] = useState<Locale>(readStoredLocale);

  const applyTheme = useCallback((mode: ThemeMode) => {
    const resolved = resolveTheme(mode);
    setResolvedTheme(resolved);
    applyResolvedTheme(resolved);
    document.documentElement.dataset.themeMode = mode;
    persistThemeMode(mode);
  }, []);

  const setThemeMode = useCallback(
    (mode: ThemeMode) => {
      setThemeModeState(mode);
      applyTheme(mode);
    },
    [applyTheme],
  );

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = next === 'zh' ? 'zh-CN' : 'en';
  }, []);

  useEffect(() => {
    applyTheme(themeMode);
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en';
  }, [applyTheme, themeMode, locale]);

  const t = useCallback(
    (path: string) => getMessage(messages[locale], path),
    [locale],
  );

  const value = useMemo(
    () => ({
      themeMode,
      resolvedTheme,
      setThemeMode,
      locale,
      setLocale,
      t,
    }),
    [themeMode, resolvedTheme, setThemeMode, locale, setLocale, t],
  );

  return (
    <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider');
  return ctx;
};
