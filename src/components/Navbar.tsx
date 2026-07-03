import { memo, useCallback, useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { animate } from 'animejs';
import { usePreferences } from '../context/PreferencesContext';
import { Glass } from './ul-liquid-glass';
import { cn } from '../lib/cn';

const navGlassOptics = {
  frost: 22,
  strength: 0.38,
  curvature: 0.48,
  depth: 0.62,
  glow: 0.2,
  glowSpread: 0.4,
  sheen: 0.42,
  sheenWidth: 3,
  saturate: 1.35,
  specular: 1.05,
  brightness: 0.14,
  dispersion: 0.35,
};

const navLinks = [
  { to: '/', labelKey: 'nav.home', shortKey: 'nav.homeShort' },
  { to: '/projects', labelKey: 'nav.projects', shortKey: 'nav.projectsShort' },
  { to: '/documents', labelKey: 'nav.documents', shortKey: 'nav.documentsShort' },
  { to: '/dependencies', labelKey: 'nav.dependencies', shortKey: 'nav.dependenciesShort' },
  { to: '/about', labelKey: 'nav.about', shortKey: 'nav.aboutShort' },
] as const;

const updateIndicator = (
  navEl: HTMLElement,
  indicatorEl: HTMLDivElement,
  pathname: string,
  scrollActive = false,
) => {
  const activeLink = navEl.querySelector(`a[href="${pathname}"]`);
  if (!activeLink || !(activeLink instanceof HTMLElement)) return;

  const navRect = navEl.getBoundingClientRect();
  const rect = activeLink.getBoundingClientRect();
  indicatorEl.style.left = `${rect.left - navRect.left}px`;
  indicatorEl.style.width = `${rect.width}px`;

  if (scrollActive && window.matchMedia('(max-width: 639px)').matches) {
    activeLink.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }
};

/** 仅负责链接文案，语言切换时只重渲染此层，不带动导航外壳与玻璃层 */
const NavTrack = memo(function NavTrack({
  pathname,
  navRef,
}: {
  pathname: string;
  navRef: RefObject<HTMLElement | null>;
}) {
  const { t } = usePreferences();
  const trackRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  const syncIndicator = useCallback((scrollActive: boolean, instant = false) => {
    const navEl = trackRef.current;
    const indicatorEl = indicatorRef.current;
    if (!navEl || !indicatorEl) return;

    if (instant) {
      indicatorEl.style.transition = 'none';
    }

    updateIndicator(navEl, indicatorEl, pathnameRef.current, scrollActive);

    if (instant) {
      indicatorEl.getBoundingClientRect();
      indicatorEl.style.transition = '';
    }
  }, []);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    nav.setAttribute('aria-label', t('nav.main'));
  }, [navRef, t]);

  useLayoutEffect(() => {
    syncIndicator(true, false);
  }, [pathname, syncIndicator]);

  useLayoutEffect(() => {
    const navEl = trackRef.current;
    if (!navEl) return;

    const ro = new ResizeObserver(() => syncIndicator(false, true));
    ro.observe(navEl);
    return () => ro.disconnect();
  }, [syncIndicator]);

  useEffect(() => {
    const onResize = () => syncIndicator(false, true);
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, [syncIndicator]);

  return (
    <div
      ref={trackRef}
      className="relative flex min-w-min items-center justify-center gap-0.5 px-2 py-2"
    >
      <div
        ref={indicatorRef}
        className="absolute bottom-2 top-2 rounded-full bg-gradient-to-b from-white/70 to-accent/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_1px_3px_rgba(154,139,122,0.15)] transition-[left,width] duration-500 ease-out dark:from-white/20 dark:to-accent/30"
        style={{ width: 0, left: 0 }}
      />
      {navLinks.map(({ to, labelKey, shortKey }) => {
        const active = pathname === to;
        return (
          <Link
            key={to}
            to={to}
            className={cn(
              'relative z-10 flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full px-3 text-sm font-medium sm:px-4',
              'transition-colors duration-300 ease-out active:scale-[0.97]',
              'motion-safe:sm:hover:scale-[1.04]',
              active
                ? 'text-foreground'
                : 'text-foreground/50 sm:hover:text-foreground/90',
            )}
          >
            <span className="sm:hidden">{t(shortKey)}</span>
            <span className="hidden sm:inline">{t(labelKey)}</span>
          </Link>
        );
      })}
    </div>
  );
});

let navIntroPlayed = false;

export const Navbar = () => {
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;

    if (navIntroPlayed) {
      el.classList.remove('opacity-0');
      return;
    }

    navIntroPlayed = true;
    animate(el, {
      translateY: [-16, 0],
      opacity: [0, 1],
      ease: 'outExpo',
      duration: 800,
      delay: 150,
      onComplete: () => {
        el.classList.remove('opacity-0');
        el.style.removeProperty('opacity');
        el.style.removeProperty('transform');
      },
    });
  }, []);

  return (
    <nav
      ref={navRef}
      className="fixed inset-x-0 top-0 z-50 opacity-0 px-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] pt-[max(3.25rem,calc(env(safe-area-inset-top)+2.5rem))] sm:pt-[max(0.75rem,env(safe-area-inset-top))] sm:pr-[max(9rem,calc(env(safe-area-inset-right)+8rem))]"
    >
      <div className="mx-auto flex w-full min-w-0 max-w-5xl justify-center">
        <Glass
          className={cn(
            'nav-scroll nav-glass w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain sm:w-fit sm:max-w-[calc(100vw-4rem)]',
            'rounded-[2rem]',
            'border border-white/65 bg-gradient-to-b from-white/55 via-white/38 to-white/22',
            'shadow-[0_10px_40px_rgba(45,42,36,0.1),0_2px_8px_rgba(45,42,36,0.06),inset_0_1px_0_rgba(255,255,255,0.75)]',
            'ring-1 ring-accent/20',
            'dark:border-white/12 dark:from-white/14 dark:via-white/8 dark:to-white/4',
            'dark:shadow-[0_10px_40px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.12)]',
            'dark:ring-white/10',
          )}
          optics={navGlassOptics}
          radius={32}
        >
          <NavTrack pathname={location.pathname} navRef={navRef} />
        </Glass>
      </div>
    </nav>
  );
};
