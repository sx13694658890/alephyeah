import { LocaleToggle } from './LocaleToggle';
import { ThemeModeToggle } from './ThemeModeToggle';

/** 桌面端右上角偏好；移动端并入导航菜单，避免双层顶栏占位 */
export const PreferencesBar = () => {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] hidden justify-end px-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] pt-[max(0.75rem,env(safe-area-inset-top))] sm:flex">
      <div className="pointer-events-auto flex items-center gap-2">
        <LocaleToggle />
        <ThemeModeToggle />
      </div>
    </div>
  );
};
