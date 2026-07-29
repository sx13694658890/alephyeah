import { useCallback, useEffect, useState } from 'react';
import { ProjectCard } from '../components/ProjectCard';
import { AnimatedSection } from '../components/AnimatedSection';
import {
  AiResourceErrorState,
  AiResourceLoadingState,
} from '../components/ai/AiResourceState';
import { activeProjects, activeProjectsEn } from '../data/active-projects';
import type { ProjectItem } from '../data/projects';
import { usePreferences } from '../context/PreferencesContext';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { loadProjects, resolveProjectError } from '../lib/project-loader';

export const Projects = () => {
  const titleRef = useScrollAnimation<HTMLDivElement>({ staggerDelay: 100 });
  const { t, locale } = usePreferences();
  const isZh = locale === 'zh';
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const liveProjects = isZh ? activeProjects : activeProjectsEn;

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await loadProjects({ force: true });
      setProjects(items);
    } catch (err) {
      setError(resolveProjectError(err));
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

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

      <section className="mb-12">
        <div className="mb-5">
          <div className="mb-1 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <h2 className="text-lg font-medium text-foreground">{t('projects.activeTitle')}</h2>
          </div>
          <p className="text-sm text-foreground/50">{t('projects.activeSubtitle')}</p>
        </div>
        <AnimatedSection staggerDelay={90}>
          <div className="grid gap-6 md:grid-cols-2">
            {liveProjects.map((project) => (
              <ProjectCard
                key={project.id}
                title={project.title}
                description={project.description}
                tags={project.tags}
                href={project.href}
                className="border-emerald-500/20 bg-emerald-500/[0.04] hover:border-emerald-500/35 dark:bg-emerald-400/[0.06]"
              />
            ))}
          </div>
        </AnimatedSection>
      </section>

      <section>
        <div className="mb-5">
          <h2 className="mb-1 text-lg font-medium text-foreground">{t('projects.repoTitle')}</h2>
          <p className="text-sm text-foreground/50">{t('projects.repoSubtitle')}</p>
        </div>

        {loading ? (
          <AiResourceLoadingState label={t('projects.loading')} />
        ) : error ? (
          <AiResourceErrorState
            message={error}
            onRetry={fetchProjects}
            retryLabel={t('projects.retry')}
          />
        ) : (
          <AnimatedSection staggerDelay={110}>
            <div className="grid gap-6 md:grid-cols-2">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  title={project.title}
                  description={project.description || t('projects.noDescription')}
                  tags={project.tags}
                  href={project.href}
                />
              ))}
            </div>
          </AnimatedSection>
        )}
      </section>
    </>
  );
};
