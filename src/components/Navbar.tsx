import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { animate } from 'animejs';
import { cn } from '../lib/cn';

const links = [
  { to: '/', label: 'Home' },
  { to: '/projects', label: 'Projects' },
  { to: '/documents', label: 'Documents' },
  { to: '/dependencies', label: 'Dependencies' },
  { to: '/about', label: 'About' },
];

export const Navbar = () => {
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (navRef.current) {
      animate(navRef.current, {
        translateY: [-16, 0],
        opacity: [0, 1],
        ease: 'outExpo',
        duration: 800,
        delay: 150,
      });
    }
  }, []);

  useEffect(() => {
    const activeLink = navRef.current?.querySelector(`a[href="${location.pathname}"]`);
    if (activeLink && indicatorRef.current) {
      const rect = activeLink.getBoundingClientRect();
      const navRect = navRef.current?.getBoundingClientRect();
      if (navRect) {
        animate(indicatorRef.current, {
          left: rect.left - navRect.left,
          width: rect.width,
          ease: 'outExpo',
          duration: 500,
        });
      }
    }
  }, [location.pathname]);

  return (
    <nav
      ref={navRef}
      className="fixed left-1/2 top-6 z-50 -translate-x-1/2 opacity-0"
    >
      <div className="relative flex items-center gap-1 rounded-full border border-border/80 bg-white/75 px-2 py-1.5 shadow-sm backdrop-blur-xl transition-shadow duration-300 hover:shadow-md">
        <div
          ref={indicatorRef}
          className="absolute bottom-1.5 top-1.5 rounded-full bg-accent/20 transition-all"
          style={{ width: 0, left: 0 }}
        />
        {links.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              'relative z-10 rounded-full px-4 py-1.5 text-sm font-medium',
              'transition-all duration-300 ease-out',
              'hover:scale-[1.04] active:scale-[0.98]',
              location.pathname === to
                ? 'text-foreground'
                : 'text-foreground/50 hover:text-foreground/85'
            )}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
};
