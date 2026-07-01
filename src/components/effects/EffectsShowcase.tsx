import { lazy, Suspense, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { CloudRain, Flame, Maximize2 } from 'lucide-react';
import { animate } from 'animejs';

import { effectItems } from '../../data/effects';
import { usePreferences } from '../../context/PreferencesContext';
import { cn } from '../../lib/cn';
import { EffectViewport } from './EffectViewport';
import type { EffectId } from './types';

const FireworksPreview = lazy(() =>
  import('./FireworksPreview').then((m) => ({ default: m.FireworksPreview })),
);
const RainWindowEffect = lazy(() =>
  import('./RainWindowEffect').then((m) => ({ default: m.RainWindowEffect })),
);

const iconMap = {
  fireworks: Flame,
  'rain-window': CloudRain,
} as const;

const EffectPreview = ({ id }: { id: EffectId }) => {
  switch (id) {
    case 'fireworks':
      return <FireworksPreview />;
    case 'rain-window':
      return <RainWindowEffect />;
    default:
      return null;
  }
};

export const EffectsShowcase = () => {
  const { t } = usePreferences();
  const [activeId, setActiveId] = useState<EffectId | null>(null);

  const handleSelect = useCallback((id: EffectId) => {
    setActiveId((prev) => {
      const next = prev === id ? null : id;
      if (next) {
        requestAnimationFrame(() => {
          const el = document.querySelector(`[data-effect-id="${next}"]`);
          if (el instanceof HTMLElement) {
            animate(el, {
              scale: [0.96, 1],
              opacity: [0.7, 1],
              ease: 'outExpo',
              duration: 420,
            });
          }
        });
      }
      return next;
    });
  }, []);

  const activeItem = effectItems.find((item) => item.id === activeId);

  return (
    <section className="pt-6" data-animate style={{ opacity: 0 }}>
      <h2 className="mb-2 text-xl font-medium text-foreground">{t('about.effectsTitle')}</h2>
      <p className="mb-4 text-sm leading-relaxed text-foreground/55">{t('about.effectsSubtitle')}</p>

      <div className="grid grid-cols-2 gap-3">
        {effectItems.map((item) => {
          const Icon = iconMap[item.id];
          const active = activeId === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item.id)}
              className={cn(
                'group flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition-all duration-300',
                'bg-white/35 backdrop-blur-sm dark:bg-white/6',
                active
                  ? 'border-accent/35 shadow-md ring-1 ring-accent/20'
                  : 'border-border hover:border-accent/25 hover:shadow-sm',
              )}
              aria-pressed={active}
            >
              <span
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
                  active
                    ? 'bg-accent/15 text-accent'
                    : 'bg-muted/50 text-foreground/60 group-hover:bg-accent/10 group-hover:text-accent',
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <span className="text-xs font-medium text-foreground">{t(item.labelKey)}</span>
              <span className="line-clamp-2 text-[10px] leading-snug text-foreground/45">
                {t(item.descKey)}
              </span>
            </button>
          );
        })}
      </div>

      {activeItem ? (
        <div className="mt-4" data-effect-id={activeItem.id}>
          <EffectViewport
            open
            title={t(activeItem.labelKey)}
            hint={t(activeItem.hintKey ?? 'about.effectsHint')}
            onClose={() => setActiveId(null)}
            action={
              activeItem.fullscreenPath ? (
                <Link
                  to={activeItem.fullscreenPath}
                  className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-border/60 px-2.5 py-1.5 text-xs text-foreground/65 transition-colors hover:border-accent/30 hover:text-accent"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                  {t('about.effectsFullscreen')}
                </Link>
              ) : undefined
            }
          >
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center text-sm text-foreground/40">
                  {t('about.effectsLoading')}
                </div>
              }
            >
              <EffectPreview id={activeItem.id} />
            </Suspense>
          </EffectViewport>
        </div>
      ) : null}
    </section>
  );
};
