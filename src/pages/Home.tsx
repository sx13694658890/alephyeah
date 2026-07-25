import { Fragment, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { animate, stagger } from 'animejs';
import { usePreferences } from '../context/PreferencesContext';
import { useParallaxScroll } from '../hooks/useParallaxScroll';
import { MusicPlayer } from '../components/music/MusicPlayer';
import { ProjectCard } from '../components/ProjectCard';
import { RetroTv } from '../components/retro-tv';
import { ScrollReveal } from '../components/ScrollReveal';
import { SkillSection } from '../components/skill/SkillSection';
import { TodayNewsSection } from '../components/home/TodayNewsSection';
import { relatedBooks } from '../data/related-books';
import { relatedLinks } from '../data/related-links';
import { cn } from '../lib/cn';

let heroIntroPlayed = false;

export const Home = () => {
  const { t } = usePreferences();
  const heroParallaxRef = useParallaxScroll<HTMLDivElement>({ speed: 0.1, maxOffset: 32 });

  const featuredProjects = [
    {
      title: 'alephyeah',
      description: t('home.projectAlephyeah'),
      tags: ['React', 'TypeScript', 'Rsbuild', 'Tailwind CSS'],
      href: 'https://github.com/sx13694658890/alephyeah',
    },
    {
      title: 'test_api',
      description: t('home.projectTestApi'),
      tags: ['FastAPI'],
      href: 'https://gitee.com/codeing-rz/test_api',
    },
    {
      title: 'shaine_go',
      description: t('home.projectShaineGo'),
      tags: ['React', 'Firebase', 'Yjs'],
      href: 'https://gitee.com/codeing-rz/shaine_go',
    },
  ];

  useEffect(() => {
    if (heroIntroPlayed) {
      animate('.hero-title span', { opacity: 1, translateY: 0, duration: 0 });
      animate('.hero-subtitle', { opacity: 1, translateY: 0, duration: 0 });
      animate('.hero-visual', { opacity: 1, translateY: 0, duration: 0 });
      return;
    }

    heroIntroPlayed = true;
    animate('.hero-title span', {
      opacity: [0, 1],
      translateY: [24, 0],
      ease: 'outExpo',
      duration: 900,
      delay: stagger(120, { start: 160 }),
    });
    animate('.hero-subtitle', {
      opacity: [0, 1],
      translateY: [18, 0],
      ease: 'outExpo',
      duration: 960,
      delay: 620,
    });
    animate('.hero-visual', {
      opacity: [0, 1],
      translateY: [28, 0],
      ease: 'outCubic',
      duration: 1000,
      delay: 380,
    });
  }, []);

  return (
    <>
      <MusicPlayer />

      {/* Hero：首屏，独立 intro，不与 ScrollReveal 混用 */}
      <section className="relative mb-20 md:mb-24">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-16 top-6 h-44 w-44 rounded-full bg-accent/10 blur-3xl md:h-56 md:w-56"
        />

        <div
          ref={heroParallaxRef}
          className="relative flex flex-col items-center gap-8 pt-6 md:gap-10 md:pt-10 lg:flex-row lg:items-center lg:justify-between lg:gap-10"
        >
          <div className="hero-visual order-2 flex w-full shrink-0 justify-center opacity-0 lg:order-1 lg:w-[min(40%,17rem)] xl:w-[min(42%,18.5rem)]">
            <RetroTv className="-my-4" />
          </div>

          <div className="order-1 mx-auto w-full max-w-xl text-center lg:order-2 lg:mx-0 lg:flex-1 lg:text-left">
            <h1 className="hero-title mb-5 text-[clamp(1.85rem,4.2vw,3rem)] font-light tracking-tight text-foreground md:mb-6">
              <span className="inline-block opacity-0">{t('home.heroHello')}</span>{' '}
              <span className="inline-block opacity-0">{t('home.heroIm')}</span>{' '}
              <span className="inline-block font-normal text-accent opacity-0">{t('home.heroName')}</span>
            </h1>
            <p className="hero-subtitle mx-auto max-w-[42ch] text-base leading-relaxed text-foreground/60 opacity-0 md:text-lg lg:mx-0">
              {t('home.heroSubtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* 资讯 */}
      <ScrollReveal className="mb-20 md:mb-24" rise={28} staggerDelay={0}>
        <div data-reveal>
          <TodayNewsSection />
        </div>
      </ScrollReveal>

      {/* About */}
      <ScrollReveal className="mb-20 md:mb-24" rise={32} staggerDelay={90}>
        <h2
          className="mb-3 text-[clamp(1.35rem,2.5vw,1.75rem)] font-light text-foreground"
          data-reveal
        >
          {t('home.aboutTitle')}
        </h2>
        <p
          className="max-w-[42ch] text-base leading-relaxed text-foreground/60 md:max-w-2xl md:text-lg"
          data-reveal
        >
          {t('home.aboutBody')}
        </p>
      </ScrollReveal>

      {/* Skills */}
      <ScrollReveal className="mb-20 md:mb-24" rise={28}>
        <div
          data-reveal
          className="overflow-hidden rounded-2xl border border-border/60 bg-white/40 p-4 backdrop-blur-sm dark:bg-white/5 md:rounded-3xl md:p-5"
        >
          <SkillSection />
        </div>
      </ScrollReveal>

      {/* Featured — 包装层负责 reveal，卡片负责 tilt */}
      <ScrollReveal className="mb-16 md:mb-20" rise={36} staggerDelay={100} delay={40}>
        <h2
          className="mb-7 text-[clamp(1.35rem,2.5vw,1.75rem)] font-light text-foreground md:mb-8"
          data-reveal
        >
          {t('home.featuredTitle')}
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {featuredProjects.map((project, index) => (
            <div
              key={project.title}
              data-reveal
              className={cn('min-w-0', index === 1 && 'lg:mt-6', index === 2 && 'sm:col-span-2 lg:col-span-1 lg:mt-3')}
            >
              <ProjectCard {...project} deferReveal className="h-full" />
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* Links */}
      <ScrollReveal className="pb-6" rise={24} staggerDelay={70}>
        <p className="text-sm text-foreground/45" data-reveal>
          {t('home.linksTitle')}
        </p>
        <p className="mt-2 text-sm" data-reveal>
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
          <p className="mt-4 text-sm" data-reveal>
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
      </ScrollReveal>
    </>
  );
};
