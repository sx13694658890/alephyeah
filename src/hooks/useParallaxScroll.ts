import { useEffect, useRef } from 'react';

interface UseParallaxScrollOptions {
  speed?: number;
  maxOffset?: number;
}

export const useParallaxScroll = <T extends HTMLElement>({
  speed = 0.15,
  maxOffset = 120,
}: UseParallaxScrollOptions = {}) => {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const viewportCenter = window.innerHeight / 2;
      const distance = (center - viewportCenter) / window.innerHeight;
      const offset = Math.max(-maxOffset, Math.min(maxOffset, distance * speed * 100));
      el.style.transform = `translate3d(0, ${offset}px, 0)`;
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      el.style.transform = '';
    };
  }, [speed, maxOffset]);

  return ref;
};
