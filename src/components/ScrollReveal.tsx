import {
  useEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from 'react';
import { animate, onScroll, type JSAnimation, type ScrollObserver } from 'animejs';
import { cn } from '../lib/cn';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  /** 垂直起落幅度（仅作用于 [data-reveal] 包装层） */
  rise?: number;
  delay?: number;
  staggerDelay?: number;
  duration?: number;
  style?: CSSProperties;
}

/**
 * 滚动进场显现。
 * 约定：只动画带 [data-reveal] 的包装层，不直接动画可交互子元素
 *（避免与 tilt / 旧 data-animate 抢 transform）。
 */
export const ScrollReveal = ({
  children,
  className,
  as: Tag = 'section',
  rise = 36,
  delay = 0,
  staggerDelay = 80,
  duration = 780,
  style,
}: ScrollRevealProps) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const list = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]')).filter(
      (node) => node.closest('.scroll-reveal') === root,
    );
    const targets = list.length > 0 ? list : [root];

    const settle = (nodes: HTMLElement[]) => {
      nodes.forEach((node) => {
        node.style.opacity = '1';
        node.style.transform = '';
        node.style.willChange = '';
      });
    };

    if (reduced) {
      settle(targets);
      return;
    }

    targets.forEach((node) => {
      node.style.opacity = '0';
      node.style.transform = `translate3d(0, ${rise}px, 0)`;
      node.style.willChange = 'transform, opacity';
    });

    let played = false;
    const animations: JSAnimation[] = [];
    const scroll: ScrollObserver = onScroll({
      target: root,
      enter: 'bottom-=12% top',
      leave: 'top+=8% bottom',
      repeat: false,
      onEnter: () => {
        if (played) return;
        played = true;

        targets.forEach((node, index) => {
          const animation = animate(node, {
            opacity: [0, 1],
            translateY: [rise, 0],
            ease: 'outCubic',
            duration,
            delay: delay + index * staggerDelay,
            onComplete: () => {
              node.style.opacity = '1';
              node.style.transform = '';
              node.style.willChange = '';
            },
          });
          animations.push(animation);
        });
      },
    });

    return () => {
      animations.forEach((animation) => {
        try {
          animation.pause();
          animation.revert?.();
        } catch {
          /* ignore */
        }
      });
      try {
        scroll.revert();
      } catch {
        /* ignore */
      }
      targets.forEach((node) => {
        node.style.willChange = '';
      });
    };
  }, [rise, delay, staggerDelay, duration]);

  return (
    <Tag ref={ref as never} className={cn('scroll-reveal', className)} style={style}>
      {children}
    </Tag>
  );
};
