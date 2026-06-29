import { UlSwitch } from './ul-switch';
import { usePreferences } from '../context/PreferencesContext';
import { cn } from '../lib/cn';

export const ThemeSwitch = ({ className }: { className?: string }) => {
  const { themeMode, cycleTheme, t } = usePreferences();

  const modeLabel =
    themeMode === 'light'
      ? t('settings.themeLight')
      : themeMode === 'dark'
        ? t('settings.themeDark')
        : t('settings.themeSystem');

  return (
    <button
      type="button"
      onClick={() => cycleTheme()}
      aria-label={`${t('settings.theme')}: ${modeLabel}`}
      title={modeLabel}
      className={cn(
        'inline-flex shrink-0 rounded-full border-0 bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-1 focus-visible:ring-offset-background',
        className,
      )}
    >
      <UlSwitch readOnly appearance={themeMode} toggleSize={14} />
    </button>
  );
};
