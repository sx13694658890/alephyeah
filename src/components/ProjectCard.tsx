import { useRef } from 'react';
import { animate } from 'animejs';
import { cn } from '../lib/cn';

interface ProjectCardProps {
  title: string;
  description: string;
  tags: string[];
  href?: string;
  className?: string;
}

export const ProjectCard = ({ title, description, tags, href, className }: ProjectCardProps) => {
  const cardRef = useRef<HTMLAnchorElement>(null);

  const handleMouseEnter = () => {
    if (cardRef.current) {
      animate(cardRef.current, {
        scale: [1, 1.02],
        translateY: [0, -4],
        ease: 'outCubic',
        duration: 300,
      });
    }
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      animate(cardRef.current, {
        scale: [1.02, 1],
        translateY: [-4, 0],
        ease: 'outCubic',
        duration: 300,
      });
    }
  };

  const Tag = href ? 'a' : 'div';

  return (
    <Tag
      ref={cardRef as any}
      href={href}
      target={href ? '_blank' : undefined}
      rel={href ? 'noopener noreferrer' : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'group rounded-2xl border border-border bg-white/60 p-6 backdrop-blur-sm',
        'transition-shadow duration-300 hover:shadow-lg',
        href && 'cursor-pointer',
        className
      )}
      style={{ opacity: 0 }}
      data-animate
    >
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mb-4 text-sm leading-relaxed text-foreground/60">{description}</p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent"
          >
            {tag}
          </span>
        ))}
      </div>
    </Tag>
  );
};
