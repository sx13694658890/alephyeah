import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wrench } from 'lucide-react';
import { usePreferences } from '../context/PreferencesContext';
import { tools } from '../data/tools';
import { cn } from '../lib/cn';

export const ToolsDropdown = memo(function ToolsDropdown() {
  const [open, setOpen] = useState(false);
  const { locale } = usePreferences();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    const onClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        close();
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open, close]);

  const isZh = locale === 'zh';

  return (
    <div className="relative flex items-center">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => !open && setOpen(true)}
        className={cn(
          'relative z-10 flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-full px-2.5 text-sm font-medium sm:min-h-11 sm:px-3',
          'transition-colors duration-300 ease-out active:scale-[0.97]',
          'motion-safe:sm:hover:scale-[1.03]',
          open
            ? 'bg-accent/12 text-foreground'
            : 'text-foreground/50 sm:hover:bg-white/35 sm:hover:text-foreground/90 dark:sm:hover:bg-white/10',
        )}
      >
        <Wrench className="h-4 w-4" />
        <span className="ml-1.5 hidden sm:inline">{isZh ? '工具' : 'Tools'}</span>
      </button>

      {open && (
        <div
          ref={dropdownRef}
          onMouseLeave={close}
          className="absolute right-0 top-full z-50 mt-2 w-72"
        >
          <div
            className={cn(
              'rounded-2xl border border-border bg-background p-2',
              'shadow-[0_12px_40px_rgba(45,42,36,0.14),0_2px_8px_rgba(45,42,36,0.08)]',
              'dark:border-border dark:bg-background',
              'dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)]',
              'animate-in fade-in slide-in-from-top-2 duration-200',
            )}
          >
            <div className="mb-1 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-foreground/40">
              {isZh ? '工具' : 'Tools'}
            </div>
            {tools.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={close}
                className={cn(
                  'flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors',
                  'hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30',
                )}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <item.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-foreground">
                    {isZh ? item.titleZh : item.title}
                  </div>
                  <div className="text-xs text-foreground/50">
                    {isZh ? item.descriptionZh : item.description}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
