import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { HeroScene } from './HeroScene';
import { PreferencesBar } from './PreferencesBar';
import { KnowledgeGateProvider } from './KnowledgeBaseGate';

export const Layout = () => {
  return (
    <KnowledgeGateProvider>
      <div className="relative min-h-screen overflow-x-clip bg-background">
        <HeroScene />
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
        {/* 移动端单行顶栏后内容上移，对齐文档站阅读节奏 */}
        <main className="page-main relative z-10 mx-auto w-full max-w-5xl lg:max-w-6xl">
          <Outlet />
        </main>
      </div>
    </KnowledgeGateProvider>
  );
};
