import { Moon, Sun } from 'lucide-react';

import { usePreferences } from '../context/PreferencesContext';
import { cn } from '../lib/cn';
import type { ThemeMode } from '../lib/theme';

const themes: { mode: ThemeMode; icon: typeof Sun; labelKey: string }[] = [
  { mode: 'light', icon: Sun, labelKey: 'settings.themeLight' },
  { mode: 'dark', icon: Moon, labelKey: 'settings.themeDark' },
];

export const ThemeModeToggle = ({ className }: { className?: string }) => {
  const { themeMode, setThemeMode, t } = usePreferences();

  return (
    <div
      role="group"
      aria-label={t('settings.theme')}
      className={cn(
        'flex gap-1 rounded-full border border-dashed border-border/70 bg-muted/30 p-1 backdrop-blur-sm',
        className,
      )}
    >
      {themes.map(({ mode, icon: Icon, labelKey }) => {
        const active = themeMode === mode;
        return (
          <button
            key={mode}
            type="button"
            aria-label={t(labelKey)}
            aria-pressed={active}
            title={t(labelKey)}
            onClick={() => setThemeMode(mode)}
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-full sm:h-7 sm:w-7',
              'text-muted-foreground transition-colors hover:text-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-1 focus-visible:ring-offset-background',
              active && 'bg-background text-foreground shadow-sm',
            )}
          >
            <Icon className="size-4" />
          </button>
        );
      })}
    </div>
  );
};
