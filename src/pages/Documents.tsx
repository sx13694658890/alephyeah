import { useRef } from 'react';
import { animate } from 'animejs';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const documents = [
  {
    title: 'Architecture Overview',
    description: 'Understanding the layered build pipeline, monorepo structure, and key design decisions behind the project stack.',
    date: '2025',
    category: 'Technical',
  },
  {
    title: 'Build Configuration Guide',
    description: 'How the Rsbuild config factory works — from shared defaults to project-specific overrides and environment injection.',
    date: '2025',
    category: 'Technical',
  },
  {
    title: 'Icon System Usage',
    description: 'A guide to using the custom SVG icon system with Iconify integration in Tailwind CSS v4 projects.',
    date: '2025',
    category: 'Technical',
  },
  {
    title: 'Deployment Pipeline',
    description: 'Cloudflare Pages deployment flow, from build to publish, including environment variable management.',
    date: '2025',
    category: 'Technical',
  },
  {
    title: 'Component Patterns',
    description: 'Notes on React component architecture, naming conventions, and the coding style guide for the project.',
    date: '2025',
    category: 'Notes',
  },
  {
    title: 'Animation Philosophy',
    description: 'Thoughts on motion design — when to animate, when to stay still, and how to keep interactions feeling intentional.',
    date: '2025',
    category: 'Notes',
  },
];

export const Documents = () => {
  const titleRef = useScrollAnimation<HTMLDivElement>({});

  return (
    <>
      <div ref={titleRef} className="mb-12">
        <h1 className="mb-3 text-3xl font-light text-foreground">Documents</h1>
        <p className="max-w-xl text-foreground/60">
          Notes, guides, and documentation — things worth writing down and sharing.
        </p>
      </div>

      <div className="space-y-4">
        {documents.map((doc, i) => (
          <DocumentCard key={i} {...doc} index={i} />
        ))}
      </div>
    </>
  );
};

const DocumentCard = ({ title, description, date, category, index }: {
  title: string;
  description: string;
  date: string;
  category: string;
  index: number;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    animate(cardRef.current, {
      translateX: 8,
      ease: 'outCubic',
      duration: 300,
    });
  };

  const handleMouseLeave = () => {
    animate(cardRef.current, {
      translateX: 0,
      ease: 'outCubic',
      duration: 300,
    });
  };

  return (
    <div
      ref={cardRef}
      data-animate
      style={{ opacity: 0 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group cursor-pointer rounded-xl border border-border bg-white/50 p-5 backdrop-blur-sm transition-shadow duration-300 hover:shadow-md"
    >
      <div className="mb-1 flex items-center gap-3">
        <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
          {category}
        </span>
        <span className="text-xs text-foreground/40">{date}</span>
      </div>
      <h3 className="mb-1.5 text-lg font-medium text-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-foreground/60">{description}</p>
    </div>
  );
};
