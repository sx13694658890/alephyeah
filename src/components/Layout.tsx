import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { HeroScene } from './HeroScene';

export const Layout = () => {
  return (
    <div className="relative min-h-screen bg-background">
      <HeroScene />
      <Navbar />
      <main className="relative z-10 mx-auto max-w-5xl px-6 pt-28 pb-20">
        <Outlet />
      </main>
    </div>
  );
};
