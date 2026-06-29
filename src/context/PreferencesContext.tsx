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
  cycleThemeMode,
  persistThemeMode,
  readStoredThemeMode,
  resolveTheme,
  type ResolvedTheme,
  type ThemeMode,
} from '../lib/theme';

const MOBILE_MQ = '(max-width: 639px)';

const isMobileViewport = () =>
  typeof window !== 'undefined' && window.matchMedia(MOBILE_MQ).matches;

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
  cycleTheme: () => void;
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

  const applyThemeForViewport = useCallback(
    (mode: ThemeMode) => {
      if (isMobileViewport()) {
        const resolved = resolveTheme('system');
        setResolvedTheme(resolved);
        applyResolvedTheme(resolved);
        document.documentElement.dataset.themeMode = 'system';
        return;
      }
      applyTheme(mode);
    },
    [applyTheme],
  );

  const setThemeMode = useCallback(
    (mode: ThemeMode) => {
      setThemeModeState(mode);
      applyTheme(mode);
    },
    [applyTheme],
  );

  const cycleTheme = useCallback(() => {
    setThemeModeState((prev) => {
      const next = cycleThemeMode(prev);
      applyTheme(next);
      return next;
    });
  }, [applyTheme]);

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
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en';
  }, [locale]);

  useEffect(() => {
    applyThemeForViewport(themeMode);
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en';

    const systemMq = window.matchMedia('(prefers-color-scheme: dark)');
    const onSystemChange = () => {
      if (isMobileViewport() || themeMode === 'system') {
        const resolved = resolveTheme('system');
        setResolvedTheme(resolved);
        applyResolvedTheme(resolved);
      }
    };

    const viewportMq = window.matchMedia(MOBILE_MQ);
    const onViewportChange = () => applyThemeForViewport(themeMode);

    systemMq.addEventListener('change', onSystemChange);
    viewportMq.addEventListener('change', onViewportChange);
    return () => {
      systemMq.removeEventListener('change', onSystemChange);
      viewportMq.removeEventListener('change', onViewportChange);
    };
  }, [applyThemeForViewport, themeMode, locale]);

  const t = useCallback(
    (path: string) => getMessage(messages[locale], path),
    [locale],
  );

  const value = useMemo(
    () => ({
      themeMode,
      resolvedTheme,
      setThemeMode,
      cycleTheme,
      locale,
      setLocale,
      t,
    }),
    [themeMode, resolvedTheme, setThemeMode, cycleTheme, locale, setLocale, t],
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
