<<<<<<< Updated upstream
import { EffectsShowcase } from '../components/effects/EffectsShowcase';
=======
import { Mail } from 'lucide-react';
>>>>>>> Stashed changes
import { usePreferences } from '../context/PreferencesContext';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useTiltHover } from '../hooks/useTiltHover';

const CONTACT_EMAIL = 'sxl5253999Xl@gmail.com';

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

          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-start">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="group flex items-center gap-3 rounded-xl border border-border bg-white/40 px-4 py-3 backdrop-blur-sm transition-[border-color,box-shadow] duration-500 hover:border-accent/25 hover:shadow-md dark:bg-white/8"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent transition-colors group-hover:bg-accent/15">
                <Mail className="size-4" aria-hidden />
              </span>
              <div>
                <div className="text-xs text-foreground/45">{t('about.emailLabel')}</div>
                <div className="text-sm font-medium text-foreground transition-colors group-hover:text-accent">
                  {CONTACT_EMAIL}
                </div>
              </div>
            </a>

            <div
              className="rounded-xl border border-border bg-white/40 p-4 backdrop-blur-sm dark:bg-white/8 sm:shrink-0"
            >
              <div className="mb-3 text-xs text-foreground/45">{t('about.wechatLabel')}</div>
              <img
                src="/contact/wechat-qr.png"
                alt={t('about.wechatHint')}
                width={168}
                height={168}
                className="mx-auto rounded-lg"
              />
              <p className="mt-3 text-center text-xs leading-relaxed text-foreground/45">
                {t('about.wechatHint')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
