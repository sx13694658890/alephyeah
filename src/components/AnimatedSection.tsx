import { useEffect, useRef, type ReactNode } from 'react';
import { animate } from 'animejs';

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
}: AnimatedSectionProps) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.style.opacity = '1';
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          animate(el, {
            opacity: [0, 1],
            translateY: [40, 0],
            ease: 'outCubic',
            duration: 800,
            onComplete: () => {
              el.style.removeProperty('opacity');
              el.style.removeProperty('transform');
            },
          });

          observer.unobserve(el);
        });
      },
      { threshold: 0.12 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={ref as never} className={className} data-animate style={{ opacity: 0 }}>
      {children}
    </Tag>
  );
};
