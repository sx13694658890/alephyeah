import { usePreferences } from '../context/PreferencesContext';
import { cn } from '../lib/cn';
import type { Locale } from '../i18n/locales';

const options: { id: Locale; labelKey: string }[] = [
  { id: 'en', labelKey: 'settings.langEn' },
  { id: 'zh', labelKey: 'settings.langZh' },
];

export const LocaleToggle = () => {
  const { locale, setLocale, t } = usePreferences();

  return (
    <div
      className="flex rounded-full border border-border/50 bg-white/25 p-px backdrop-blur-sm dark:bg-white/8"
      role="group"
      aria-label={t('settings.language')}
    >
      {options.map(({ id, labelKey }) => {
        const active = locale === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setLocale(id)}
            className={cn(
              'min-h-7 min-w-7 rounded-full px-2 text-[11px] font-medium leading-none transition-colors duration-200',
              active
                ? 'bg-accent/25 text-foreground'
                : 'text-foreground/45 hover:text-foreground/75',
            )}
          >
            {t(labelKey)}
          </button>
        );
      })}
    </div>
  );
};
