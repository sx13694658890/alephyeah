import { usePreferences } from '../context/PreferencesContext';
import { cn } from '../lib/cn';
import type { Locale } from '../i18n/locales';

const options: { id: Locale; labelKey: string }[] = [
  { id: 'en', labelKey: 'settings.langEn' },
  { id: 'zh', labelKey: 'settings.langZh' },
];

export const LocaleToggle = ({ className }: { className?: string }) => {
  const { locale, setLocale, t } = usePreferences();

  return (
    <div
      role="group"
      aria-label={t('settings.language')}
      className={cn(
        'flex gap-0.5 rounded-full border border-dashed border-border/70 bg-muted/30 p-1 backdrop-blur-sm',
        className,
      )}
    >
      {options.map(({ id, labelKey }) => {
        const active = locale === id;
        return (
          <button
            key={id}
            type="button"
            aria-label={t(labelKey)}
            aria-pressed={active}
            title={t(labelKey)}
            onClick={() => setLocale(id)}
            className={cn(
              'flex h-8 min-w-8 shrink-0 items-center justify-center rounded-full px-2 text-[11px] font-medium sm:h-7',
              'text-muted-foreground transition-colors hover:text-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-1 focus-visible:ring-offset-background',
              active && 'bg-background text-foreground shadow-sm',
            )}
          >
            {t(labelKey)}
          </button>
        );
      })}
    </div>
  );
};
