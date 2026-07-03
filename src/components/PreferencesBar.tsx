import { LocaleToggle } from './LocaleToggle';
import { ThemeModeToggle } from './ThemeModeToggle';

export const PreferencesBar = () => {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex justify-end px-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="pointer-events-auto flex items-center gap-2">
        <LocaleToggle />
        <ThemeModeToggle />
      </div>
    </div>
  );
};
