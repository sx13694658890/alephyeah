import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { animate } from 'animejs';

import { useReducedMotion } from '../../hooks/useReducedMotion';
import { cn } from '../../lib/cn';

interface EffectViewportProps {
  title: string;
  hint?: string;
  open: boolean;
  onClose: () => void;
  action?: ReactNode;
  children: ReactNode;
}

export const EffectViewport = ({ title, hint, open, onClose, action, children }: EffectViewportProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!open || reducedMotion || !panelRef.current) return;

    animate(panelRef.current, {
      opacity: [0, 1],
      translateY: [10, 0],
      ease: 'outExpo',
      duration: 480,
    });
  }, [open, reducedMotion]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      className={cn(
        'relative overflow-hidden rounded-2xl border border-border/70 bg-foreground/[0.03]',
        'shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
        reducedMotion ? 'opacity-100' : 'opacity-0',
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border/50 px-4 py-2.5">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-medium text-foreground">{title}</h3>
          {hint ? <p className="mt-0.5 text-xs text-foreground/45">{hint}</p> : null}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {action}
          <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-foreground/50 transition-colors hover:bg-muted/60 hover:text-foreground"
          aria-label="关闭特效"
        >
          <X className="h-4 w-4" />
        </button>
        </div>
      </div>

      <div className="relative h-[min(360px,52vh)] w-full overflow-hidden bg-black">
        <div className="absolute inset-0">{children}</div>
      </div>
    </div>
  );
};
