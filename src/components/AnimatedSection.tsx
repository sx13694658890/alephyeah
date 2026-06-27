import type { ReactNode, RefObject } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { cn } from '../lib/cn';

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
  staggerDelay = 100,
  delay = 0,
}: AnimatedSectionProps) => {
  const ref = useScrollAnimation<HTMLElement>({ staggerDelay, delay });

  return (
    <Tag ref={ref as RefObject<HTMLDivElement & HTMLElement>} className={cn(className)}>
      {children}
    </Tag>
  );
};
