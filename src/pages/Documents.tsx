import { useState } from 'react';
import { AiHubCard } from '../components/ai/AiHubCard';
import { AiResourceModal } from '../components/ai/AiResourceModal';
import { AnimatedSection } from '../components/AnimatedSection';
import { DocumentModal } from '../components/documents/DocumentModal';
import type { AiResourceView } from '../data/ai-resources';
import { usePreferences } from '../context/PreferencesContext';
import { crawlerDocuments } from '../docs/crawler';
import { rsbuildDocument } from '../docs/rsbuild';
import type { ProjectDocument } from '../docs/types';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useTiltHover } from '../hooks/useTiltHover';

const documents: Array<{
  title: string;
  description: string;
  date: string;
  category: string;
  doc?: ProjectDocument;
}> = [
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
    doc: rsbuildDocument,
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

const DocumentCard = ({
  title,
  description,
  date,
  category,
  onClick,
}: {
  title: string;
  description: string;
  date: string;
  category: string;
  onClick?: () => void;
}) => {
  const { ref, onMouseMove, onMouseLeave } = useTiltHover<HTMLDivElement>({
    maxTilt: 3,
    scale: 1.01,
  });

  const interactive = Boolean(onClick);

  return (
    <div
      ref={ref}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      data-animate
      style={{
        opacity: 0,
        transition: 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.5s ease, border-color 0.5s ease',
      }}
      className={`group rounded-xl border border-border bg-white/50 p-5 backdrop-blur-sm transition-[border-color,box-shadow] duration-500 dark:bg-white/8 ${
        interactive
          ? 'cursor-pointer hover:border-accent/20 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40'
          : ''
      }`}
    >
      <div className="mb-1 flex items-center gap-3">
        <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent transition-colors duration-300 group-hover:bg-accent/15">
          {category}
        </span>
        <span className="text-xs text-foreground/40">{date}</span>
      </div>
      <h3 className="mb-1.5 text-lg font-medium text-foreground transition-colors duration-300 group-hover:text-accent">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-foreground/60">{description}</p>
    </div>
  );
};

export const Documents = () => {
  const titleRef = useScrollAnimation<HTMLDivElement>({ staggerDelay: 90 });
  const listRef = useScrollAnimation<HTMLDivElement>({ staggerDelay: 80, delay: 100 });
  const { t } = usePreferences();
  const [aiOpen, setAiOpen] = useState(false);
  const [aiView, setAiView] = useState<AiResourceView>('skills');
  const [docOpen, setDocOpen] = useState(false);
  const [activeDoc, setActiveDoc] = useState<ProjectDocument | null>(null);

  const openAiHub = (view: AiResourceView) => {
    setAiView(view);
    setAiOpen(true);
  };

  const openDocument = (doc: ProjectDocument) => {
    setActiveDoc(doc);
    setDocOpen(true);
  };

  return (
    <>
      <div ref={titleRef} className="mb-12">
        <h1 className="mb-3 text-3xl font-light text-foreground" data-animate style={{ opacity: 0 }}>
          {t('documents.title')}
        </h1>
        <p className="max-w-xl text-foreground/60" data-animate style={{ opacity: 0 }}>
          {t('documents.subtitle')}
        </p>
      </div>

      <AnimatedSection className="mb-10" staggerDelay={110}>
        <AiHubCard onOpen={openAiHub} />
      </AnimatedSection>

      <div ref={listRef} className="space-y-4">
        {crawlerDocuments.map((doc) => (
          <DocumentCard
            key={doc.id}
            title={doc.title}
            description={doc.description}
            date={doc.date}
            category={doc.category}
            onClick={() => openDocument(doc)}
          />
        ))}
        {documents.map((doc) => (
          <DocumentCard
            key={doc.title}
            title={doc.title}
            description={doc.description}
            date={doc.date}
            category={doc.category}
            onClick={doc.doc ? () => openDocument(doc.doc!) : undefined}
          />
        ))}
      </div>

      <AiResourceModal open={aiOpen} onClose={() => setAiOpen(false)} view={aiView} />
      <DocumentModal open={docOpen} doc={activeDoc} onClose={() => setDocOpen(false)} />
    </>
  );
};
