import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { HeroScene } from './HeroScene';
import { PreferencesBar } from './PreferencesBar';

export const Layout = () => {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-background">
      <HeroScene />
      {/* 顶部环境光：与导航玻璃形成色差，折射更明显 */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-[1] h-[min(42vh,320px)] dark:opacity-80"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 90% 70% at 50% -10%, rgba(196, 181, 165, 0.38) 0%, transparent 62%), radial-gradient(ellipse 55% 45% at 85% 8%, rgba(154, 139, 122, 0.22) 0%, transparent 55%), radial-gradient(ellipse 45% 40% at 12% 12%, rgba(212, 197, 181, 0.28) 0%, transparent 50%)',
        }}
      />
      <PreferencesBar />
      <Navbar />
      <main className="relative z-10 mx-auto max-w-5xl px-[max(1.25rem,env(safe-area-inset-left))] pb-[max(5rem,env(safe-area-inset-bottom))] pt-[max(6.5rem,calc(env(safe-area-inset-top)+5rem))] sm:px-6 sm:pt-28">
        <Outlet />
      </main>
    </div>
  );
};
