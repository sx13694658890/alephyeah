import { ThemeSwitch } from './ThemeSwitch';

export const PreferencesBar = () => {
  return (
    <div
      className="fixed right-[max(0.75rem,env(safe-area-inset-right))] top-[max(0.75rem,env(safe-area-inset-top))] z-[60] hidden items-center sm:flex"
    >
      <ThemeSwitch />
    </div>
  );
};
