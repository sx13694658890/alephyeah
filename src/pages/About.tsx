import { useState } from 'react';

import { DocumentModal } from '../components/documents/DocumentModal';
import { EffectsShowcase } from '../components/effects/EffectsShowcase';
import { usePreferences } from '../context/PreferencesContext';
import { rsbuildDocument } from '../docs/rsbuild';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useTiltHover } from '../hooks/useTiltHover';
import { cn } from '../lib/cn';

function SkillCard({
  label,
  desc,
  onClick,
}: {
  label: string;
  desc: string;
  onClick?: () => void;
}) {
  const { ref, onMouseMove, onMouseLeave } = useTiltHover<HTMLDivElement>({
    maxTilt: 4,
    scale: 1.03,
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
      className={cn(
        'rounded-xl border border-border bg-white/40 p-4 backdrop-blur-sm transition-[border-color,box-shadow] duration-500 dark:bg-white/8',
        interactive &&
          'cursor-pointer hover:border-accent/25 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
        !interactive && 'hover:border-accent/25 hover:shadow-md',
      )}
      style={{
        opacity: 0,
        transition: 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.5s ease, border-color 0.5s ease',
      }}
      data-animate
    >
      <div className="text-sm font-medium text-foreground">{label}</div>
      <div className="mt-0.5 text-xs text-foreground/50">{desc}</div>
    </div>
  );
}

export const About = () => {
  const titleRef = useScrollAnimation<HTMLDivElement>({});
  const contentRef = useScrollAnimation<HTMLDivElement>({ delay: 120, staggerDelay: 80 });
  const { t } = usePreferences();
  const [docOpen, setDocOpen] = useState(false);

  const skills = [
    { label: 'TypeScript', desc: t('about.skillTs') },
    { label: 'React', desc: t('about.skillReact') },
    { label: 'Rsbuild', desc: t('about.skillRsbuild'), onClick: () => setDocOpen(true) },
    { label: 'Tailwind CSS', desc: t('about.skillTailwind') },
    { label: 'Three.js', desc: t('about.skillThree') },
    { label: 'Cloudflare', desc: t('about.skillCloudflare') },
  ];

  return (
    <>
      <div ref={titleRef} className="mb-12">
        <h1 className="mb-3 text-3xl font-light text-foreground" data-animate style={{ opacity: 0 }}>
          {t('about.title')}
        </h1>
      </div>

      <div ref={contentRef} className="max-w-2xl space-y-6">
        <p className="text-lg leading-relaxed text-foreground/70" data-animate style={{ opacity: 0 }}>
          {t('about.p1')}
        </p>

        <p className="text-lg leading-relaxed text-foreground/70" data-animate style={{ opacity: 0 }}>
          {t('about.p2')}
        </p>

        <h2 className="pt-6 text-xl font-medium text-foreground" data-animate style={{ opacity: 0 }}>
          {t('about.skillsTitle')}
        </h2>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {skills.map((skill) => (
            <SkillCard key={skill.label} {...skill} />
          ))}
        </div>

        <EffectsShowcase />

        <div className="pt-6" data-animate style={{ opacity: 0 }}>
          <h2 className="mb-4 text-xl font-medium text-foreground">{t('about.contactTitle')}</h2>
          <p className="leading-relaxed text-foreground/70">{t('about.contactBody')}</p>
        </div>
      </div>

      <DocumentModal open={docOpen} doc={rsbuildDocument} onClose={() => setDocOpen(false)} />
    </>
  );
};
