import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { animate } from 'animejs';
import { BookOpen, Ellipsis, Wrench } from 'lucide-react';
import { usePreferences } from '../context/PreferencesContext';
import { useKnowledgeGate } from './KnowledgeBaseGate';
import { isKnowledgeUnlocked } from '../lib/knowledge-gate';
import { LocaleToggle } from './LocaleToggle';
import { ThemeModeToggle } from './ThemeModeToggle';
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

/** 主导航：滚动指示器只跟踪这些路由 */
const primaryLinks = [
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
  if (!activeLink || !(activeLink instanceof HTMLElement)) {
    indicatorEl.style.opacity = '0';
    return;
  }

  indicatorEl.style.opacity = '1';
  const navRect = navEl.getBoundingClientRect();
  const rect = activeLink.getBoundingClientRect();
  indicatorEl.style.left = `${rect.left - navRect.left}px`;
  indicatorEl.style.width = `${rect.width}px`;

  if (scrollActive && window.matchMedia('(max-width: 639px)').matches) {
    activeLink.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }
};

/** 仅负责主链文案与指示器 */
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
      className="relative flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto overscroll-x-contain px-1.5 py-1.5 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden"
    >
      <div
        ref={indicatorRef}
        className="pointer-events-none absolute bottom-1.5 top-1.5 rounded-full bg-linear-to-b from-white/70 to-accent/25 opacity-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_1px_3px_rgba(154,139,122,0.15)] transition-[left,width,opacity] duration-500 ease-out dark:from-white/20 dark:to-accent/30"
        style={{ width: 0, left: 0 }}
      />
      {primaryLinks.map(({ to, labelKey, shortKey }) => {
        const active = pathname === to;
        return (
          <Link
            key={to}
            to={to}
            className={cn(
              'relative z-10 flex min-h-11 shrink-0 items-center justify-center rounded-full px-3 text-sm font-medium sm:min-h-11 sm:px-3.5',
              'transition-colors duration-300 ease-out active:scale-[0.97]',
              'motion-safe:sm:hover:scale-[1.03]',
              active ? 'text-foreground' : 'text-foreground/50 sm:hover:text-foreground/90',
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

const KnowledgeToolsSegment = memo(function KnowledgeToolsSegment({
  pathname,
}: {
  pathname: string;
}) {
  const { t, locale } = usePreferences();
  const navigate = useNavigate();
  const { requestUnlock } = useKnowledgeGate();
  const isZh = locale === 'zh';
  const knowledgeActive = pathname === '/knowledge-base' || pathname.startsWith('/knowledge-base/');
  const toolsActive = pathname === '/tools' || pathname.startsWith('/tools/');

  const goKnowledge = (e: ReactMouseEvent) => {
    e.preventDefault();
    if (isKnowledgeUnlocked()) {
      navigate('/knowledge-base');
      return;
    }
    requestUnlock(() => navigate('/knowledge-base'));
  };

  return (
    <div
      role="group"
      aria-label={isZh ? '知识库与工具' : 'Knowledge and tools'}
      className={cn(
        'flex shrink-0 items-center rounded-full border border-border/70 bg-background p-1',
        'shadow-[0_1px_2px_rgba(45,42,36,0.05)]',
      )}
    >
      <a
        href="/knowledge-base"
        onClick={goKnowledge}
        aria-current={knowledgeActive ? 'page' : undefined}
        className={cn(
          'relative z-10 flex min-h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium sm:min-h-10 sm:px-3.5',
          'transition-[color,background-color,box-shadow,transform] duration-300 ease-out',
          'active:scale-[0.97]',
          knowledgeActive
            ? 'bg-muted text-foreground shadow-sm'
            : 'text-foreground/55 hover:text-foreground/90',
        )}
      >
        <BookOpen className="h-3.5 w-3.5 opacity-70" aria-hidden />
        <span>{t('nav.knowledgeBase')}</span>
      </a>
      <Link
        to="/tools"
        aria-current={toolsActive ? 'page' : undefined}
        className={cn(
          'relative z-10 flex min-h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium sm:min-h-10 sm:px-3.5',
          'transition-[color,background-color,box-shadow,transform] duration-300 ease-out',
          'active:scale-[0.97]',
          toolsActive
            ? 'bg-muted text-foreground shadow-sm'
            : 'text-foreground/55 hover:text-foreground/90',
        )}
      >
        <Wrench className="h-3.5 w-3.5 opacity-70" aria-hidden />
        <span>{isZh ? '工具' : 'Tools'}</span>
      </Link>
    </div>
  );
});

/** 移动端：侧边小图标展开知识库 / 工具，避免挤占主导航 */
const KnowledgeToolsMobileMenu = memo(function KnowledgeToolsMobileMenu({
  pathname,
}: {
  pathname: string;
}) {
  const { t, locale } = usePreferences();
  const navigate = useNavigate();
  const { requestUnlock } = useKnowledgeGate();
  const isZh = locale === 'zh';
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const knowledgeActive = pathname === '/knowledge-base' || pathname.startsWith('/knowledge-base/');
  const toolsActive = pathname === '/tools' || pathname.startsWith('/tools/');
  const anyActive = knowledgeActive || toolsActive;

  const close = useCallback(() => setOpen(false), []);

  const goKnowledge = () => {
    close();
    if (isKnowledgeUnlocked()) {
      navigate('/knowledge-base');
      return;
    }
    requestUnlock(() => navigate('/knowledge-base'));
  };

  useEffect(() => {
    close();
  }, [pathname, close]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    const onPointer = (e: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('touchstart', onPointer, { passive: true });
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('touchstart', onPointer);
    };
  }, [open, close]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={isZh ? '知识库与工具' : 'Knowledge and tools'}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-full',
          'transition-[color,background-color,transform] duration-300 ease-out active:scale-[0.95]',
          open || anyActive
            ? 'bg-muted text-foreground shadow-sm'
            : 'text-foreground/55',
        )}
      >
        <Ellipsis className="h-4 w-4" aria-hidden />
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            'absolute right-0 top-full z-50 mt-2 w-[min(18rem,calc(100vw-1.5rem))]',
            'rounded-2xl border border-border bg-background p-1.5',
            'shadow-[0_12px_40px_rgba(45,42,36,0.14),0_2px_8px_rgba(45,42,36,0.08)]',
            'dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)]',
          )}
        >
          <button
            type="button"
            role="menuitem"
            onClick={goKnowledge}
            aria-current={knowledgeActive ? 'page' : undefined}
            className={cn(
              'flex min-h-11 w-full items-center gap-2.5 rounded-xl px-3 text-left text-sm font-medium',
              'transition-colors duration-200',
              knowledgeActive
                ? 'bg-muted text-foreground'
                : 'text-foreground/70 active:bg-muted/70',
            )}
          >
            <BookOpen className="h-4 w-4 opacity-70" aria-hidden />
            <span>{t('nav.knowledgeBase')}</span>
          </button>
          <Link
            role="menuitem"
            to="/tools"
            onClick={close}
            aria-current={toolsActive ? 'page' : undefined}
            className={cn(
              'flex min-h-11 items-center gap-2.5 rounded-xl px-3 text-sm font-medium',
              'transition-colors duration-200',
              toolsActive
                ? 'bg-muted text-foreground'
                : 'text-foreground/70 active:bg-muted/70',
            )}
          >
            <Wrench className="h-4 w-4 opacity-70" aria-hidden />
            <span>{isZh ? '工具' : 'Tools'}</span>
          </Link>

          <div className="my-1.5 border-t border-border/70" />
          <div className="space-y-2 px-2 py-2">
            <p className="text-[11px] font-medium uppercase tracking-wider text-foreground/40">
              {isZh ? '偏好' : 'Prefs'}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <LocaleToggle />
              <ThemeModeToggle />
            </div>
          </div>
        </div>
      )}
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
      className="fixed inset-x-0 top-0 z-50 px-[max(0.5rem,env(safe-area-inset-left))] pr-[max(0.5rem,env(safe-area-inset-right))] pt-[max(0.5rem,env(safe-area-inset-top))] opacity-0 sm:pr-[max(9rem,calc(env(safe-area-inset-right)+8rem))] sm:pt-[max(0.75rem,env(safe-area-inset-top))]"
    >
      <div className="mx-auto flex w-full min-w-0 max-w-5xl justify-center">
        <Glass
          className={cn(
            'nav-scroll nav-glass w-full min-w-0 max-w-full overflow-visible sm:w-auto sm:max-w-[calc(100vw-4rem)]',
            'rounded-2xl px-1 py-1 sm:rounded-[1.75rem] sm:px-1.5',
            'border border-white/65 bg-linear-to-b from-white/55 via-white/38 to-white/22',
            'shadow-[0_10px_40px_rgba(45,42,36,0.1),0_2px_8px_rgba(45,42,36,0.06),inset_0_1px_0_rgba(255,255,255,0.75)]',
            'ring-1 ring-accent/20',
            'dark:border-white/12 dark:from-white/14 dark:via-white/8 dark:to-white/4',
            'dark:shadow-[0_10px_40px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.12)]',
            'dark:ring-white/10',
          )}
          optics={navGlassOptics}
          radius={28}
        >
          {/* GlassMaterial 强制 inline-block，flex 必须放在内部容器 */}
          <div className="flex w-full min-w-0 max-w-full flex-row items-center gap-0.5 sm:gap-1">
            <NavTrack pathname={location.pathname} navRef={navRef} />

            <div
              className="mx-0.5 hidden h-5 w-px shrink-0 bg-border/45 sm:block"
              aria-hidden
            />

            {/* 移动端：旁侧 … 图标展开；桌面：完整分段控件 */}
            <div className="flex shrink-0 items-center pr-0.5 sm:hidden">
              <KnowledgeToolsMobileMenu pathname={location.pathname} />
            </div>
            <div className="hidden shrink-0 items-center pr-1 sm:flex">
              <KnowledgeToolsSegment pathname={location.pathname} />
            </div>
          </div>
        </Glass>
      </div>
    </nav>
  );
};
