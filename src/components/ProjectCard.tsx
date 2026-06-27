import type { RefObject } from 'react';
import { useTiltHover } from '../hooks/useTiltHover';
import { cn } from '../lib/cn';

interface ProjectCardProps {
  title: string;
  description: string;
  tags: string[];
  href?: string;
  className?: string;
}

export const ProjectCard = ({ title, description, tags, href, className }: ProjectCardProps) => {
  const { ref, onMouseMove, onMouseLeave } = useTiltHover<HTMLAnchorElement>({
    maxTilt: 5,
    scale: 1.02,
  });

  const Tag = href ? 'a' : 'div';

  return (
    <Tag
      ref={ref as RefObject<HTMLAnchorElement>}
      href={href}
      target={href ? '_blank' : undefined}
      rel={href ? 'noopener noreferrer' : undefined}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={cn(
        'group rounded-2xl border border-border bg-white/60 p-6 backdrop-blur-sm',
        'shadow-sm transition-[box-shadow,border-color] duration-500 ease-out',
        'hover:border-accent/30 hover:shadow-xl hover:shadow-accent/5',
        href && 'cursor-pointer',
        className
      )}
      style={{
        opacity: 0,
        transform: 'perspective(800px)',
        transition: 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.5s ease, border-color 0.5s ease',
      }}
      data-animate
    >
      <h3 className="mb-2 text-lg font-semibold text-foreground transition-colors duration-300 group-hover:text-accent">
        {title}
      </h3>
      <p className="mb-4 text-sm leading-relaxed text-foreground/60 transition-colors duration-300 group-hover:text-foreground/70">
        {description}
      </p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent transition-all duration-300 group-hover:bg-accent/15 group-hover:scale-[1.03]"
          >
            {tag}
          </span>
        ))}
      </div>
    </Tag>
  );
};
