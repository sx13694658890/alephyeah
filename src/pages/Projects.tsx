import { useCallback, useEffect, useState } from 'react';
import { ProjectCard } from '../components/ProjectCard';
import { AnimatedSection } from '../components/AnimatedSection';
import {
  AiResourceErrorState,
  AiResourceLoadingState,
} from '../components/ai/AiResourceState';
import type { ProjectItem } from '../data/projects';
import { usePreferences } from '../context/PreferencesContext';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { loadProjects, resolveProjectError } from '../lib/project-loader';

export const Projects = () => {
  const titleRef = useScrollAnimation<HTMLDivElement>({ staggerDelay: 100 });
  const { t } = usePreferences();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await loadProjects();
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
    </>
  );
};
