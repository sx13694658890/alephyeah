import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';

interface UseScrollAnimationOptions {
  threshold?: number;
  staggerDelay?: number;
  translateY?: number;
  duration?: number;
  delay?: number;
}

export const useScrollAnimation = <T extends HTMLElement>({
  threshold = 0.15,
  staggerDelay = 80,
  translateY = 40,
  duration = 800,
  delay = 0,
}: UseScrollAnimationOptions = {}) => {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const targets = el.querySelectorAll('[data-animate]');
            const animationTargets = targets.length
              ? Array.from(targets)
              : el;

            animate(animationTargets, {
              opacity: [0, 1],
              translateY: [translateY, 0],
              ease: 'outCubic',
              duration,
              delay: targets.length
                ? stagger(staggerDelay, { start: delay })
                : delay,
            });

            observer.unobserve(el);
          }
        });
      },
      { threshold }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [threshold, staggerDelay, translateY, duration, delay]);

  return ref;
};
