import { useEffect } from 'react';
import { animate, stagger } from 'animejs';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { AnimatedSection } from '../components/AnimatedSection';
import { ProjectCard } from '../components/ProjectCard';
import { SkillSection } from '../components/skill/SkillSection';

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
  const heroRef = useScrollAnimation<HTMLDivElement>({ delay: 400 });
  const introRef = useScrollAnimation<HTMLDivElement>({ delay: 100 });

  useEffect(() => {
    animate('.hero-title span', {
      opacity: [0, 1],
      translateY: [30, 0],
      ease: 'outCubic',
      duration: 800,
      delay: stagger(100, { start: 300 }),
    });
  }, []);

  return (
    <>
      <section className="mb-32 min-h-[60vh]">
        <div ref={heroRef} className="mx-auto max-w-2xl pt-16 text-center">
          <h1 className="hero-title mb-6 text-4xl font-light tracking-tight text-foreground md:text-5xl">
            <span className="inline-block">Hello,</span>{' '}
            <span className="inline-block">I'm</span>{' '}
            <span className="inline-block font-normal text-accent">Aleph</span>
          </h1>
          <p className="mx-auto max-w-lg text-lg leading-relaxed text-foreground/60">
            A space for projects, thoughts, and the tools I build along the way.
            Exploring the intersection of design, code, and craft.
          </p>
        </div>
      </section>

      <AnimatedSection className="mb-24">
        <div ref={introRef}>
          <h2 className="mb-3 text-2xl font-light text-foreground">About This Space</h2>
          <p className="max-w-2xl leading-relaxed text-foreground/60">
            This is my personal corner of the web — a place to share what I'm working on,
            document what I'm learning, and keep track of the component ecosystem that
            powers my projects. Everything here is built with care and a touch of curiosity.
          </p>
        </div>
      </AnimatedSection>

      <AnimatedSection className="mb-24">
        <SkillSection />
      </AnimatedSection>

      <AnimatedSection className="mb-16">
        <h2 className="mb-8 text-2xl font-light text-foreground">Featured Work</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.title} {...project} />
          ))}
        </div>
      </AnimatedSection>
    </>
  );
};
