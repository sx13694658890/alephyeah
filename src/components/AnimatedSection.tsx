import { useEffect, useRef, type ReactNode } from 'react';
import { animate, stagger } from 'animejs';

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  as?: 'section' | 'div';
  staggerDelay?: number;
  delay?: number;
}

export const AnimatedSection = ({
  children,
  className,
  as: Tag = 'section',
  staggerDelay = 90,
  delay = 0,
}: AnimatedSectionProps) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reveal = (nodes: HTMLElement[]) => {
      nodes.forEach((node) => {
        node.style.opacity = '1';
        node.style.removeProperty('transform');
      });
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const targets = el.querySelectorAll('[data-animate]');
      reveal(Array.from(targets) as HTMLElement[]);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const targets = el.querySelectorAll('[data-animate]');
          const animationTargets = targets.length
            ? (Array.from(targets) as HTMLElement[])
            : [el];

          animate(animationTargets, {
            opacity: [0, 1],
            translateY: [40, 0],
            scale: [0.97, 1],
            ease: 'outCubic',
            duration: 800,
            delay: targets.length ? stagger(staggerDelay, { start: delay }) : delay,
            onComplete: () => reveal(animationTargets),
          });

          observer.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [staggerDelay, delay]);

  return (
    <Tag ref={ref as never} className={className}>
      {children}
    </Tag>
  );
};
