import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';

interface UseScrollAnimationOptions {
  threshold?: number;
  staggerDelay?: number;
  translateY?: number;
  duration?: number;
  delay?: number;
  scale?: number;
  once?: boolean;
}

export const useScrollAnimation = <T extends HTMLElement>({
  threshold = 0.12,
  staggerDelay = 90,
  translateY = 32,
  duration = 900,
  delay = 0,
  scale = 0.97,
  once = true,
}: UseScrollAnimationOptions = {}) => {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      el.querySelectorAll('[data-animate]').forEach((node) => {
        (node as HTMLElement).style.opacity = '1';
        (node as HTMLElement).style.transform = 'none';
      });
      el.style.opacity = '1';
      el.style.transform = 'none';
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const targets = el.querySelectorAll('[data-animate]');
          const animationTargets = targets.length ? Array.from(targets) : el;

          animate(animationTargets, {
            opacity: [0, 1],
            translateY: [translateY, 0],
            scale: [scale, 1],
            ease: 'outExpo',
            duration,
            delay: targets.length
              ? stagger(staggerDelay, { start: delay })
              : delay,
          });

          if (once) observer.unobserve(el);
        });
      },
      { threshold, rootMargin: '0px 0px -8% 0px' }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [threshold, staggerDelay, translateY, duration, delay, scale, once]);

  return ref;
};
