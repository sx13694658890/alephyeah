import { ProjectCard } from '../components/ProjectCard';
import { AnimatedSection } from '../components/AnimatedSection';
import { usePreferences } from '../context/PreferencesContext';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const projects = [
  {
    title: 'alephyeah Blog',
    description: 'Personal blog platform built with React, Rsbuild, and Tailwind CSS v4. Features a minimalist design with subtle 3D visuals and smooth scroll animations.',
    tags: ['React', 'Rsbuild', 'Tailwind CSS', 'Three.js', 'Anime.js'],
    href: 'https://github.com',
  },
  {
    title: '@init-project/rsbuild',
    description: 'Shared build configuration package providing a layered Rsbuild config factory with support for React and Vue targets, proxy setup, and environment injection.',
    tags: ['Rsbuild', 'Rspack', 'Monorepo', 'TypeScript'],
  },
  {
    title: '@init-project/iconsvg',
    description: 'Custom SVG icon system integrated with Iconify and Tailwind CSS v4. Provides a curated set of icons for use across projects via Tailwind icon utility classes.',
    tags: ['SVG', 'Iconify', 'Tailwind', 'Icon System'],
  },
  {
    title: 'Design Token System',
    description: 'A comprehensive design token framework for maintaining consistent spacing, colors, typography, and shadows across multiple frontend projects.',
    tags: ['Design Tokens', 'CSS', 'Theming', 'Light/Dark'],
  },
  {
    title: 'Monorepo Toolchain',
    description: 'pnpm workspace setup with layered package structure, shared build config, and private npm registry for internal package distribution.',
    tags: ['pnpm', 'Monorepo', 'npm Registry', 'DevOps'],
  },
  {
    title: 'Animation Library',
    description: 'Collection of reusable scroll-triggered animations and micro-interactions built with anime.js for consistent motion design across pages.',
    tags: ['Anime.js', 'Animation', 'React Hooks', 'Intersection Observer'],
  },
];

export const Projects = () => {
  const titleRef = useScrollAnimation<HTMLDivElement>({ staggerDelay: 100 });
  const { t } = usePreferences();

  return (
    <>
      <div ref={titleRef} className="mb-12">
        <h1 className="mb-3 text-3xl font-light text-foreground" data-animate style={{ opacity: 0 }}>
          {t('projects.title')}
        </h1>
        <p className="max-w-xl text-foreground/60" data-animate style={{ opacity: 0 }}>
          {t('projects.subtitle')}
        </p>
      </div>

      <AnimatedSection staggerDelay={110}>
        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.title} {...project} />
          ))}
        </div>
      </AnimatedSection>
    </>
  );
};
