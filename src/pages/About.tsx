import { EffectsShowcase } from '../components/effects/EffectsShowcase';
import { usePreferences } from '../context/PreferencesContext';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useTiltHover } from '../hooks/useTiltHover';

function SkillCard({ label, desc }: { label: string; desc: string }) {
  const { ref, onMouseMove, onMouseLeave } = useTiltHover<HTMLDivElement>({
    maxTilt: 4,
    scale: 1.03,
  });

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="rounded-xl border border-border bg-white/40 p-4 backdrop-blur-sm transition-[border-color,box-shadow] duration-500 hover:border-accent/25 hover:shadow-md dark:bg-white/8"
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

  const skills = [
    { label: 'TypeScript', desc: t('about.skillTs') },
    { label: 'React', desc: t('about.skillReact') },
    { label: 'Rsbuild', desc: t('about.skillRsbuild') },
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
    </>
  );
};
