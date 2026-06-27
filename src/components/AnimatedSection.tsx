import type { ReactNode } from 'react';

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  as?: 'section' | 'div';
}

export const AnimatedSection = ({ children, className, as: Tag = 'section' }: AnimatedSectionProps) => {
  return (
    <Tag
      className={className}
      data-animate
      style={{ opacity: 0 }}
    >
      {children}
    </Tag>
  );
};
