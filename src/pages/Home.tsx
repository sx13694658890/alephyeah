import { useEffect } from 'react';
import { animate, stagger } from 'animejs';
import { useParallaxScroll } from '../hooks/useParallaxScroll';
import { AnimatedSection } from '../components/AnimatedSection';
import { ProjectCard } from '../components/ProjectCard';

const featuredProjects = [
  {
    title: 'alephyeah',
    description: 'Personal blog and portfolio built with React, Rsbuild, and TypeScript. A curated space for projects, documentation, and component references.',
    tags: ['React', 'TypeScript', 'Rsbuild', 'Tailwind CSS'],
    href: 'https://github.com/alephyeah',
  },
  {
    title: 'Build Toolchain',
    description: 'Shared Rsbuild configuration package supporting React targets. Layered config factory with hot reload, proxy, and environment injection.',
    tags: ['Rsbuild', 'Rspack', 'Monorepo'],
  },
  {
    title: 'Design System',
    description: 'Component dependency management and version tracking for internal packages used across projects.',
    tags: ['pnpm', 'Workspace', 'Private Registry'],
  },
];

export const Home = () => {
  const heroParallaxRef = useParallaxScroll<HTMLDivElement>({ speed: 0.12, maxOffset: 40 });

  useEffect(() => {
    animate('.hero-title span', {
      opacity: [0, 1],
      translateY: [24, 0],
      ease: 'outExpo',
      duration: 900,
      delay: stagger(120, { start: 200 }),
    });
    animate('.hero-subtitle', {
      opacity: [0, 1],
      translateY: [20, 0],
      ease: 'outExpo',
      duration: 1000,
      delay: 650,
    });
  }, []);

  return (
    <>
      <section className="mb-32 min-h-[65vh]">
        <div ref={heroParallaxRef} className="mx-auto max-w-2xl pt-16 text-center">
          <h1 className="hero-title mb-6 text-4xl font-light tracking-tight text-foreground md:text-5xl">
            <span className="inline-block opacity-0">Hello,</span>{' '}
            <span className="inline-block opacity-0">I'm</span>{' '}
            <span className="inline-block font-normal text-accent opacity-0">Aleph</span>
          </h1>
          <p className="hero-subtitle mx-auto max-w-lg text-lg leading-relaxed text-foreground/60 opacity-0">
            A space for projects, thoughts, and the tools I build along the way.
            Exploring the intersection of design, code, and craft.
          </p>
        </div>
      </section>

      <AnimatedSection className="mb-24" delay={80}>
        <h2 className="mb-3 text-2xl font-light text-foreground" data-animate style={{ opacity: 0 }}>
          About This Space
        </h2>
        <p className="max-w-2xl leading-relaxed text-foreground/60" data-animate style={{ opacity: 0 }}>
          This is my personal corner of the web — a place to share what I'm working on,
          document what I'm learning, and keep track of the component ecosystem that
          powers my projects. Everything here is built with care and a touch of curiosity.
        </p>
      </AnimatedSection>

      <AnimatedSection className="mb-16" staggerDelay={120} delay={100}>
        <h2 className="mb-8 text-2xl font-light text-foreground" data-animate style={{ opacity: 0 }}>
          Featured Work
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.title} {...project} />
          ))}
        </div>
      </AnimatedSection>
    </>
  );
};
