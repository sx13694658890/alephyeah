import { Fragment, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { animate, stagger } from 'animejs';
import { usePreferences } from '../context/PreferencesContext';
import { useParallaxScroll } from '../hooks/useParallaxScroll';
import { MusicPlayer } from '../components/music/MusicPlayer';
import { AnimatedSection } from '../components/AnimatedSection';
import { ProjectCard } from '../components/ProjectCard';
import { SkillSection } from '../components/skill/SkillSection';
import { relatedBooks } from '../data/related-books';
import { relatedLinks } from '../data/related-links';

let heroIntroPlayed = false;

export const Home = () => {
  const { t } = usePreferences();
  const heroParallaxRef = useParallaxScroll<HTMLDivElement>({ speed: 0.12, maxOffset: 40 });

  const featuredProjects = [
    {
      title: 'alephyeah',
      description: t('home.projectAlephyeah'),
      tags: ['React', 'TypeScript', 'Rsbuild', 'Tailwind CSS'],
      href: 'https://github.com/alephyeah',
    },
    {
      title: 'Build Toolchain',
      description: t('home.projectToolchain'),
      tags: ['Rsbuild', 'Rspack', 'Monorepo'],
    },
    {
      title: 'Design System',
      description: t('home.projectDesign'),
      tags: ['pnpm', 'Workspace', 'Private Registry'],
    },
  ];

  useEffect(() => {
    if (heroIntroPlayed) {
      animate('.hero-title span', { opacity: 1, translateY: 0, duration: 0 });
      animate('.hero-subtitle', { opacity: 1, translateY: 0, duration: 0 });
      return;
    }

    heroIntroPlayed = true;
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
      <MusicPlayer />

      <section className="mb-32 min-h-[65vh]">
        <div ref={heroParallaxRef} className="mx-auto max-w-2xl pt-16 text-center">
          <h1 className="hero-title mb-6 text-4xl font-light tracking-tight text-foreground md:text-5xl">
            <span className="inline-block opacity-0">{t('home.heroHello')}</span>{' '}
            <span className="inline-block opacity-0">{t('home.heroIm')}</span>{' '}
            <span className="inline-block font-normal text-accent opacity-0">{t('home.heroName')}</span>
          </h1>
          <p className="hero-subtitle mx-auto max-w-lg text-lg leading-relaxed text-foreground/60 opacity-0">
            {t('home.heroSubtitle')}
          </p>
        </div>
      </section>

      <AnimatedSection className="mb-24" delay={80}>
        <h2 className="mb-3 text-2xl font-light text-foreground" data-animate style={{ opacity: 0 }}>
          {t('home.aboutTitle')}
        </h2>
        <p className="max-w-2xl leading-relaxed text-foreground/60" data-animate style={{ opacity: 0 }}>
          {t('home.aboutBody')}
        </p>
      </AnimatedSection>

      <AnimatedSection className="mb-24">
        <SkillSection />
      </AnimatedSection>

      <AnimatedSection className="mb-16">
        <h2 className="mb-8 text-2xl font-light text-foreground">{t('home.featuredTitle')}</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.title} {...project} />
          ))}
        </div>
      </AnimatedSection>

      <AnimatedSection className="pt-4">
        <p className="text-sm text-foreground/45" data-animate style={{ opacity: 0 }}>
          {t('home.linksTitle')}
        </p>
        <p className="mt-2 text-sm" data-animate style={{ opacity: 0 }}>
          {relatedLinks.map((link, index) => (
            <Fragment key={link.id}>
              {index > 0 ? <span className="mx-3 text-foreground/20">/</span> : null}
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/55 underline-offset-4 transition-colors hover:text-accent hover:underline"
              >
                {t(link.labelKey)}
              </a>
            </Fragment>
          ))}
        </p>

        {relatedBooks.length > 0 ? (
          <p className="mt-4 text-sm" data-animate style={{ opacity: 0 }}>
            {relatedBooks.map((book, index) => (
              <Fragment key={book.id}>
                {index > 0 ? <span className="mx-3 text-foreground/20">/</span> : null}
                <Link
                  to={`/books/${book.id}`}
                  className="text-foreground/55 underline-offset-4 transition-colors hover:text-accent hover:underline"
                >
                  {t(book.titleKey)}
                </Link>
              </Fragment>
            ))}
          </p>
        ) : null}
      </AnimatedSection>
    </>
  );
};
